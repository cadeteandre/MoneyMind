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
    // Criar categorias padrão para EXPENSE
    console.log('📊 Creating default EXPENSE categories...')
    for (const categoryName of DEFAULT_CATEGORIES.EXPENSE) {
      const category = await prisma.category.upsert({
        where: {
          name_userId: {
            name: categoryName,
            userId: null // null = categoria padrão (não pertence a nenhum usuário)
          }
        },
        update: {
          // Se já existe, atualiza o tipo (por segurança)
          type: TransactionType.EXPENSE,
          isDefault: true
        },
        create: {
          name: categoryName,
          type: TransactionType.EXPENSE,
          isDefault: true,
          userId: null // Categoria global/padrão
        }
      })
      console.log(`  ✅ Created/Updated: ${category.name} (${category.type})`)
    }
    
    // Criar categorias padrão para INCOME
    console.log('💰 Creating default INCOME categories...')
    for (const categoryName of DEFAULT_CATEGORIES.INCOME) {
      const category = await prisma.category.upsert({
        where: {
          name_userId: {
            name: categoryName,
            userId: null
          }
        },
        update: {
          type: TransactionType.INCOME,
          isDefault: true
        },
        create: {
          name: categoryName,
          type: TransactionType.INCOME,
          isDefault: true,
          userId: null
        }
      })
      console.log(`  ✅ Created/Updated: ${category.name} (${category.type})`)
    }
    
    // Verificar quantas categorias foram criadas
    const totalCategories = await prisma.category.count({
      where: { isDefault: true }
    })
    
    console.log(`\n🎉 Seed completed successfully!`)
    console.log(`📊 Total default categories in database: ${totalCategories}`)
    console.log(`   - EXPENSE categories: ${DEFAULT_CATEGORIES.EXPENSE.length}`)
    console.log(`   - INCOME categories: ${DEFAULT_CATEGORIES.INCOME.length}`)
    
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