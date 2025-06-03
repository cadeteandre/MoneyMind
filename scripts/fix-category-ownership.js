import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCategoryOwnership() {
  try {
    console.log('🔧 Iniciando correção de propriedade das categorias...')
    
    // 1. Buscar todas as categorias customizadas órfãs
    const orphanCategories = await prisma.category.findMany({
      where: {
        isDefault: false,
        userId: null
      },
      include: {
        transactions: {
          select: {
            userId: true,
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })
    
    console.log(`📊 Encontradas ${orphanCategories.length} categorias órfãs`)
    
    // 2. Analisar ownership para cada categoria
    const ownershipAnalysis = []
    
    for (const category of orphanCategories) {
      // Contar quantas transações cada usuário tem com esta categoria
      const userUsage = {}
      
      category.transactions.forEach(transaction => {
        const userId = transaction.userId
        if (!userUsage[userId]) {
          userUsage[userId] = {
            count: 0,
            userInfo: transaction.user
          }
        }
        userUsage[userId].count++
      })
      
      // Determinar o usuário com mais transações (owner mais provável)
      const users = Object.entries(userUsage)
      if (users.length === 0) {
        // Categoria sem transações (não deveria acontecer após migração)
        ownershipAnalysis.push({
          category,
          action: 'DELETE',
          reason: 'Sem transações associadas'
        })
      } else if (users.length === 1) {
        // Apenas um usuário usa esta categoria
        const [userId, usage] = users[0]
        ownershipAnalysis.push({
          category,
          action: 'ASSIGN',
          userId,
          userInfo: usage.userInfo,
          transactionCount: usage.count,
          confidence: 'HIGH'
        })
      } else {
        // Múltiplos usuários usam esta categoria
        const sortedUsers = users.sort((a, b) => b[1].count - a[1].count)
        const [primaryUserId, primaryUsage] = sortedUsers[0]
        
        // Se um usuário tem significativamente mais uso (>60%), atribuir a ele
        const totalTransactions = users.reduce((sum, [, usage]) => sum + usage.count, 0)
        const primaryPercentage = (primaryUsage.count / totalTransactions) * 100
        
        if (primaryPercentage >= 60) {
          ownershipAnalysis.push({
            category,
            action: 'ASSIGN',
            userId: primaryUserId,
            userInfo: primaryUsage.userInfo,
            transactionCount: primaryUsage.count,
            confidence: 'MEDIUM',
            note: `${primaryPercentage.toFixed(1)}% das transações`
          })
        } else {
          // Criar cópias para cada usuário significativo (>20% das transações)
          ownershipAnalysis.push({
            category,
            action: 'DUPLICATE',
            users: sortedUsers.filter(([, usage]) => (usage.count / totalTransactions) >= 0.2)
              .map(([userId, usage]) => ({
                userId,
                userInfo: usage.userInfo,
                transactionCount: usage.count,
                percentage: ((usage.count / totalTransactions) * 100).toFixed(1)
              })),
            confidence: 'LOW'
          })
        }
      }
    }
    
    // 3. Mostrar análise
    console.log('\n📋 Análise de propriedade:')
    
    const assignActions = ownershipAnalysis.filter(a => a.action === 'ASSIGN')
    const duplicateActions = ownershipAnalysis.filter(a => a.action === 'DUPLICATE')
    const deleteActions = ownershipAnalysis.filter(a => a.action === 'DELETE')
    
    console.log(`✅ Atribuições diretas: ${assignActions.length}`)
    console.log(`🔄 Duplicações necessárias: ${duplicateActions.length}`)
    console.log(`🗑️  Deletar (sem uso): ${deleteActions.length}`)
    
    // 4. Mostrar exemplos de cada tipo
    if (assignActions.length > 0) {
      console.log('\n✅ Exemplos de atribuições diretas:')
      assignActions.slice(0, 5).forEach(item => {
        console.log(`  "${item.category.name}" → ${item.userInfo.email} (${item.transactionCount} transações, ${item.confidence})`)
      })
    }
    
    if (duplicateActions.length > 0) {
      console.log('\n🔄 Categorias que serão duplicadas:')
      duplicateActions.slice(0, 3).forEach(item => {
        console.log(`  "${item.category.name}":`)
        item.users.forEach(user => {
          console.log(`    → ${user.userInfo.email} (${user.transactionCount} transações, ${user.percentage}%)`)
        })
      })
    }
    
    if (deleteActions.length > 0) {
      console.log('\n🗑️  Categorias sem uso (serão deletadas):')
      deleteActions.forEach(item => {
        console.log(`  "${item.category.name}" (${item.reason})`)
      })
    }
    
    // 5. Confirmar execução
    console.log(`\n❓ Deseja executar as correções? (Execute com --execute para aplicar)`)
    
    if (process.argv.includes('--execute')) {
      console.log(`\n🚀 Executando correções...`)
      
      let assignedCount = 0
      let duplicatedCount = 0
      let deletedCount = 0
      
      // Executar atribuições diretas
      for (const item of assignActions) {
        await prisma.category.update({
          where: { id: item.category.id },
          data: { userId: item.userId }
        })
        assignedCount++
        console.log(`✅ "${item.category.name}" → ${item.userInfo.email}`)
      }
      
      // Executar duplicações
      for (const item of duplicateActions) {
        const originalCategory = item.category
        
        // Atribuir a categoria original ao usuário principal
        const primaryUser = item.users[0]
        await prisma.category.update({
          where: { id: originalCategory.id },
          data: { userId: primaryUser.userId }
        })
        console.log(`🔄 "${originalCategory.name}" (original) → ${primaryUser.userInfo.email}`)
        
        // Criar cópias para outros usuários
        for (let i = 1; i < item.users.length; i++) {
          const user = item.users[i]
          
          // Verificar se o usuário já tem uma categoria com este nome
          const existingCategory = await prisma.category.findFirst({
            where: {
              name: originalCategory.name,
              type: originalCategory.type,
              userId: user.userId
            }
          })
          
          if (!existingCategory) {
            const newCategory = await prisma.category.create({
              data: {
                name: originalCategory.name,
                type: originalCategory.type,
                isDefault: false,
                userId: user.userId
              }
            })
            
            // Atualizar transações deste usuário para usar a nova categoria
            await prisma.transaction.updateMany({
              where: {
                userId: user.userId,
                categoryId: originalCategory.id
              },
              data: {
                categoryId: newCategory.id
              }
            })
            
            duplicatedCount++
            console.log(`🔄 "${originalCategory.name}" (cópia) → ${user.userInfo.email}`)
          }
        }
      }
      
      // Executar deletações
      for (const item of deleteActions) {
        await prisma.category.delete({
          where: { id: item.category.id }
        })
        deletedCount++
        console.log(`🗑️  Deletada: "${item.category.name}"`)
      }
      
      console.log(`\n✅ Correções concluídas!`)
      console.log(`📊 Categorias atribuídas: ${assignedCount}`)
      console.log(`🔄 Categorias duplicadas: ${duplicatedCount}`)
      console.log(`🗑️  Categorias deletadas: ${deletedCount}`)
      
      // Verificação final
      const remainingOrphans = await prisma.category.count({
        where: { isDefault: false, userId: null }
      })
      console.log(`🔗 Categorias órfãs restantes: ${remainingOrphans}`)
      
    } else {
      console.log(`\n💡 Para executar as correções, rode:`)
      console.log(`node scripts/fix-category-ownership.js --execute`)
    }
    
  } catch (error) {
    console.error('❌ Erro na correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategoryOwnership() 