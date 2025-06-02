import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProduction() {
  try {
    console.log('🔍 Verificando integridade da produção...')
    
    // 1. Verificar usuários
    const userCount = await prisma.user.count()
    console.log(`👥 Usuários: ${userCount}`)
    
    // 2. Verificar transações
    const transactionCount = await prisma.transaction.count()
    console.log(`💳 Transações: ${transactionCount}`)
    
    // 3. Verificar categorias padrão
    const defaultCategories = await prisma.category.count({
      where: { isDefault: true }
    })
    console.log(`📁 Categorias padrão: ${defaultCategories}`)
    
    // 4. Verificar categorias por tipo
    const incomeCategories = await prisma.category.count({
      where: { type: 'INCOME', isDefault: true }
    })
    const expenseCategories = await prisma.category.count({
      where: { type: 'EXPENSE', isDefault: true }
    })
    
    console.log(`📈 Income padrão: ${incomeCategories}`)
    console.log(`📉 Expense padrão: ${expenseCategories}`)
    
    // 5. Listar categorias padrão
    const categories = await prisma.category.findMany({
      where: { isDefault: true },
      select: { name: true, type: true }
    })
    
    console.log('\n📋 Categorias padrão criadas:')
    categories.forEach(cat => {
      console.log(`  ${cat.type}: ${cat.name}`)
    })
    
    // 6. Verificar se há transações órfãs
    const transactionsWithoutCategory = await prisma.transaction.count({
      where: {
        categoryId: null,
        category: { not: { in: categories.map(c => c.name) } }
      }
    })
    
    if (transactionsWithoutCategory > 0) {
      console.log(`⚠️  ${transactionsWithoutCategory} transações com categorias não mapeadas`)
    }
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProduction() 