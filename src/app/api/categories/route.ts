import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { 
  CreateCategoryRequest, 
  CategoriesResponse, 
  CategoryResponse, 
  ErrorResponse,
  CategoriesQuery 
} from '@/interfaces/ICategory'

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" } as ErrorResponse,
        { status: 401 }
      )
    }

    // 2. Extrair query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as CategoriesQuery['type'] || 'ALL'
    const includeCount = searchParams.get('includeCount') === 'true'

    // 3. Buscar categorias no banco
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },           // Categorias padrão
          { userId: user.id }            // Categorias do usuário
        ],
        ...(type !== 'ALL' && { type }) // Filtro opcional por tipo
      },
      include: includeCount ? {
        _count: { select: { transactions: true }}
      } : undefined,
      orderBy: { name: 'asc' }
    })

    // 4. Resposta
    const response: CategoriesResponse = {
      categories,
      total: categories.length
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: "Internal server error" } as ErrorResponse,
      { status: 500 }
    )
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" } as ErrorResponse,
        { status: 401 }
      )
    }

    // 2. Validar request body
    const body: CreateCategoryRequest = await request.json()
    const { name, type } = body

    // Validações básicas
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required", code: "VALIDATION_ERROR" } as ErrorResponse,
        { status: 400 }
      )
    }

    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be INCOME or EXPENSE", code: "VALIDATION_ERROR" } as ErrorResponse,
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // 3. Verificar duplicata
    const existing = await prisma.category.findUnique({
      where: { 
        name_userId: { 
          name: trimmedName, 
          userId: user.id 
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { 
          error: "Category with this name already exists", 
          code: "DUPLICATE_CATEGORY" 
        } as ErrorResponse,
        { status: 409 }
      )
    }

    // 4. Criar categoria
    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        type,
        userId: user.id,
        isDefault: false
      }
    })

    // 5. Resposta
    const response: CategoryResponse = {
      category
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: "Internal server error" } as ErrorResponse,
      { status: 500 }
    )
  }
} 