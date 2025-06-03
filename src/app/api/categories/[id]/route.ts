import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { 
  UpdateCategoryRequest, 
  CategoryResponse, 
  ErrorResponse 
} from '@/interfaces/ICategory'

// PUT /api/categories/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Verificar autenticação
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" } as ErrorResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    // 2. Verificar se categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found", code: "NOT_FOUND" } as ErrorResponse,
        { status: 404 }
      )
    }

    // 3. Verificar se é categoria padrão (não pode editar)
    if (existingCategory.isDefault) {
      return NextResponse.json(
        { 
          error: "Cannot edit default categories", 
          code: "FORBIDDEN_OPERATION" 
        } as ErrorResponse,
        { status: 403 }
      )
    }

    // 4. Verificar ownership
    if (existingCategory.userId !== user.id) {
      return NextResponse.json(
        { 
          error: "You can only edit your own categories", 
          code: "FORBIDDEN_ACCESS" 
        } as ErrorResponse,
        { status: 403 }
      )
    }

    // 5. Validar request body
    const body: UpdateCategoryRequest = await request.json()
    const { name, type } = body

    // Preparar dados para atualização
    const updateData: Partial<Pick<typeof existingCategory, 'name' | 'type'>> = {}

    if (name !== undefined) {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Name cannot be empty", code: "VALIDATION_ERROR" } as ErrorResponse,
          { status: 400 }
        )
      }

      // Verificar duplicata (apenas se o nome mudou)
      if (trimmedName !== existingCategory.name) {
        const duplicate = await prisma.category.findUnique({
          where: { 
            name_userId: { 
              name: trimmedName, 
              userId: user.id 
            }
          }
        })

        if (duplicate) {
          return NextResponse.json(
            { 
              error: "Category with this name already exists", 
              code: "DUPLICATE_CATEGORY" 
            } as ErrorResponse,
            { status: 409 }
          )
        }
      }

      updateData.name = trimmedName
    }

    if (type !== undefined) {
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return NextResponse.json(
          { error: "Type must be INCOME or EXPENSE", code: "VALIDATION_ERROR" } as ErrorResponse,
          { status: 400 }
        )
      }
      updateData.type = type
    }

    // 6. Atualizar categoria
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData
    })

    // 7. Resposta
    const response: CategoryResponse = {
      category: updatedCategory
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: "Internal server error" } as ErrorResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Verificar autenticação
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" } as ErrorResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    // 2. Verificar se categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found", code: "NOT_FOUND" } as ErrorResponse,
        { status: 404 }
      )
    }

    // 3. Verificar se é categoria padrão (não pode deletar)
    if (existingCategory.isDefault) {
      return NextResponse.json(
        { 
          error: "Cannot delete default categories", 
          code: "FORBIDDEN_OPERATION" 
        } as ErrorResponse,
        { status: 403 }
      )
    }

    // 4. Verificar ownership
    if (existingCategory.userId !== user.id) {
      return NextResponse.json(
        { 
          error: "You can only delete your own categories", 
          code: "FORBIDDEN_ACCESS" 
        } as ErrorResponse,
        { status: 403 }
      )
    }

    // 5. Verificar se há transações vinculadas
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category with existing transactions (${transactionCount} transactions)`, 
          code: "CATEGORY_IN_USE",
          details: `This category is being used by ${transactionCount} transaction(s). Please reassign or delete these transactions first.`
        } as ErrorResponse,
        { status: 409 }
      )
    }

    // 6. Deletar categoria
    await prisma.category.delete({
      where: { id }
    })

    // 7. Resposta
    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: "Internal server error" } as ErrorResponse,
      { status: 500 }
    )
  }
} 