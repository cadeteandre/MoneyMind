import { useState, useEffect } from 'react'
import { ICategory, CreateCategoryRequest, CategoriesResponse, CategoryResponse } from '@/interfaces/ICategory'

interface UseCategoriesOptions {
  type?: 'INCOME' | 'EXPENSE' | 'ALL'
  includeCount?: boolean
}

interface UseCategoriesReturn {
  categories: ICategory[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (categoryData: CreateCategoryRequest) => Promise<ICategory>
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { type = 'ALL', includeCount = false } = options
  
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir query params
      const params = new URLSearchParams()
      if (type !== 'ALL') params.append('type', type)
      if (includeCount) params.append('includeCount', 'true')

      const response = await fetch(`/api/categories?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`)
      }

      const data: CategoriesResponse = await response.json()
      setCategories(data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: CreateCategoryRequest): Promise<ICategory> => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const data: CategoryResponse = await response.json()
      
      // Adicionar nova categoria à lista local
      setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)))
      
      return data.category
    } catch (err) {
      console.error('Error creating category:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [type, includeCount])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory
  }
} 