import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

// Categorias padrão em inglês (como dados do seu projeto)
const DEFAULT_CATEGORIES = {
  EXPENSE: [
    'Food & Dining',
    'Transportation', 
    'Housing',
    'Healthcare',
    'Clothing',
    'Education',
    'Entertainment',
    'Technology',
    'Financial Services',
    'Other'
  ],
  INCOME: [
    'Salary',
    'Investments',
    'Freelance',
    'Gifts',
    'Other'
  ]
} as const

async function main() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Verificar se já existem categorias padrão
    const existingCategories = await prisma.category.count({
      where: { isDefault: true }
    })

    if (existingCategories > 0) {
      console.log(`📊 Found ${existingCategories} existing default categories. Skipping seed.`)
      return
    }

    // Preparar dados para criação
    const categoriesToCreate = [
      // Categorias de EXPENSE
      ...DEFAULT_CATEGORIES.EXPENSE.map(name => ({
        name,
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null
      })),
      // Categorias de INCOME  
      ...DEFAULT_CATEGORIES.INCOME.map(name => ({
        name,
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null
      }))
    ]

    // Criar todas as categorias de uma vez
    console.log('📊 Creating default categories...')
    const result = await prisma.category.createMany({
      data: categoriesToCreate,
      skipDuplicates: true
    })
    
    console.log(`✅ Created ${result.count} default categories`)
    
    // Verificar resultado final
    const totalCategories = await prisma.category.count({
      where: { isDefault: true }
    })
    
    const expenseCount = await prisma.category.count({
      where: { isDefault: true, type: TransactionType.EXPENSE }
    })
    
    const incomeCount = await prisma.category.count({
      where: { isDefault: true, type: TransactionType.INCOME }
    })
    
    console.log(`\n🎉 Seed completed successfully!`)
    console.log(`📊 Total default categories in database: ${totalCategories}`)
    console.log(`   - EXPENSE categories: ${expenseCount}`)
    console.log(`   - INCOME categories: ${incomeCount}`)
    
  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  }
}

// Executar o seed
main()
  .catch((e) => {
    console.error('💥 Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...')
    await prisma.$disconnect()
  }) 