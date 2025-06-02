export interface ICategory {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  isDefault: boolean
  userId: string | null
  createdAt: Date
}

export interface ICategoryWithTransactionCount extends ICategory {
  _count?: {
    transactions: number
  }
}

// Request types
export interface CreateCategoryRequest {
  name: string
  type: "INCOME" | "EXPENSE"
}

export interface UpdateCategoryRequest {
  name?: string
  type?: "INCOME" | "EXPENSE"
}

// Response types
export interface CategoriesResponse {
  categories: ICategory[]
  total: number
}

export interface CategoryResponse {
  category: ICategory
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: string
}

// Query params
export interface CategoriesQuery {
  type?: "INCOME" | "EXPENSE" | "ALL"
  includeCount?: boolean
} 