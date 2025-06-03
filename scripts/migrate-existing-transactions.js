import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingTransactions() {
  try {
    console.log('🔄 Iniciando migração de transações existentes...')
    
    // 1. Verificar estado antes da migração
    const totalTransactions = await prisma.transaction.count()
    const transactionsWithoutCategoryId = await prisma.transaction.count({
      where: { categoryId: null }
    })
    
    console.log(`📊 Total de transações: ${totalTransactions}`)
    console.log(`🔗 Transações sem categoryId: ${transactionsWithoutCategoryId}`)
    
    // 2. Buscar todas as categorias padrão
    const defaultCategories = await prisma.category.findMany({
      where: { isDefault: true },
      select: { id: true, name: true, type: true }
    })
    
    console.log(`📁 Categorias padrão disponíveis: ${defaultCategories.length}`)
    
    // 3. Criar mapa para busca rápida
    const categoryMap = new Map()
    defaultCategories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase().trim(), cat)
    })
    
    // 4. Buscar transações sem categoryId
    const orphanTransactions = await prisma.transaction.findMany({
      where: { categoryId: null },
      select: { id: true, category: true, type: true }
    })
    
    console.log(`\n🔍 Analisando ${orphanTransactions.length} transações órfãs...`)
    
    // 5. Análise de mapeamento
    let exactMatches = 0
    let noMatches = 0
    let typeMismatches = 0
    const matchResults = []
    
    for (const transaction of orphanTransactions) {
      const categoryKey = transaction.category.toLowerCase().trim()
      const matchedCategory = categoryMap.get(categoryKey)
      
      if (matchedCategory) {
        // Verificar se o tipo bate (INCOME vs EXPENSE)
        if (matchedCategory.type === transaction.type) {
          exactMatches++
          matchResults.push({
            transactionId: transaction.id,
            categoryId: matchedCategory.id,
            oldCategory: transaction.category,
            newCategory: matchedCategory.name,
            type: transaction.type,
            action: 'LINK'
          })
        } else {
          typeMismatches++
          matchResults.push({
            transactionId: transaction.id,
            oldCategory: transaction.category,
            expectedType: transaction.type,
            foundType: matchedCategory.type,
            action: 'TYPE_MISMATCH'
          })
        }
      } else {
        noMatches++
        matchResults.push({
          transactionId: transaction.id,
          oldCategory: transaction.category,
          type: transaction.type,
          action: 'CREATE_CUSTOM'
        })
      }
    }
    
    console.log(`\n📈 Resultados da análise:`)
    console.log(`✅ Correspondências exatas: ${exactMatches}`)
    console.log(`⚠️  Incompatibilidade de tipo: ${typeMismatches}`)
    console.log(`🆕 Novas categorias necessárias: ${noMatches}`)
    
    // 6. Mostrar exemplos
    if (exactMatches > 0) {
      console.log(`\n✅ Exemplos de correspondências que serão linkadas:`)
      matchResults
        .filter(r => r.action === 'LINK')
        .slice(0, 5)
        .forEach(r => {
          console.log(`  "${r.oldCategory}" → ${r.type} Category`)
        })
    }
    
    if (noMatches > 0) {
      console.log(`\n🆕 Exemplos de categorias que virarão customizadas:`)
      const uniqueCategories = [...new Set(
        matchResults
          .filter(r => r.action === 'CREATE_CUSTOM')
          .map(r => r.oldCategory)
      )]
      uniqueCategories.slice(0, 5).forEach(cat => {
        console.log(`  "${cat}"`)
      })
    }
    
    if (typeMismatches > 0) {
      console.log(`\n⚠️  Problemas de tipo encontrados:`)
      matchResults
        .filter(r => r.action === 'TYPE_MISMATCH')
        .slice(0, 3)
        .forEach(r => {
          console.log(`  "${r.oldCategory}" está marcada como ${r.expectedType} mas categoria padrão é ${r.foundType}`)
        })
    }
    
    // 7. Confirmar se deve prosseguir
    console.log(`\n❓ Deseja executar a migração? (Execute com --execute para aplicar)`)
    
    if (process.argv.includes('--execute')) {
      console.log(`\n🚀 Executando migração...`)
      
      // 8. Criar categorias customizadas para categorias únicas
      const uniqueCustomCategories = [...new Set(
        matchResults
          .filter(r => r.action === 'CREATE_CUSTOM')
          .map(r => ({ name: r.oldCategory, type: r.type }))
      )]
      
      const createdCustomCategories = new Map()
      
      for (const customCat of uniqueCustomCategories) {
        try {
          const created = await prisma.category.create({
            data: {
              name: customCat.name,
              type: customCat.type,
              isDefault: false,
              userId: null // Categoria "global" customizada
            }
          })
          createdCustomCategories.set(customCat.name, created)
          console.log(`📁 Categoria customizada criada: "${customCat.name}" (${customCat.type})`)
        } catch (error) {
          console.log(`⚠️  Categoria "${customCat.name}" já existe ou erro:`, error.message)
          // Buscar existente
          const existing = await prisma.category.findFirst({
            where: { name: customCat.name, type: customCat.type }
          })
          if (existing) {
            createdCustomCategories.set(customCat.name, existing)
          }
        }
      }
      
      // 9. Atualizar transações com correspondência exata
      let updatedCount = 0
      for (const match of matchResults.filter(r => r.action === 'LINK')) {
        await prisma.transaction.update({
          where: { id: match.transactionId },
          data: { categoryId: match.categoryId }
        })
        updatedCount++
      }
      
      // 10. Atualizar transações para categorias customizadas
      for (const custom of matchResults.filter(r => r.action === 'CREATE_CUSTOM')) {
        const customCategory = createdCustomCategories.get(custom.oldCategory)
        if (customCategory) {
          await prisma.transaction.update({
            where: { id: custom.transactionId },
            data: { categoryId: customCategory.id }
          })
          updatedCount++
        }
      }
      
      console.log(`\n✅ Migração concluída!`)
      console.log(`📊 Transações atualizadas: ${updatedCount}`)
      console.log(`📁 Categorias customizadas criadas: ${createdCustomCategories.size}`)
      
      // 11. Verificação final
      const remainingOrphans = await prisma.transaction.count({
        where: { categoryId: null }
      })
      console.log(`🔗 Transações ainda sem categoryId: ${remainingOrphans}`)
      
    } else {
      console.log(`\n💡 Para executar a migração, rode:`)
      console.log(`node scripts/migrate-existing-transactions.js --execute`)
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateExistingTransactions() 