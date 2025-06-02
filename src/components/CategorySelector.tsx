"use client"

import React, { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCategories } from '@/hooks/useCategories'
import { toast } from 'sonner'

interface CategorySelectorProps {
  type: 'INCOME' | 'EXPENSE'
  value?: string
  onChange: (categoryId: string, categoryName: string) => void
  placeholder?: string
  error?: string
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  value,
  onChange,
  placeholder = "Select category",
  error
}) => {
  const { categories, loading, createCategory } = useCategories({ type })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setIsCreating(true)
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        type
      })
      
      // Selecionar a nova categoria automaticamente
      onChange(newCategory.id, newCategory.name)
      
      // Fechar modal e limpar form
      setIsModalOpen(false)
      setNewCategoryName('')
      
      toast.success(`Category "${newCategory.name}" created successfully!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === '__ADD_NEW__') {
      setIsModalOpen(true)
      return
    }

    const selectedCategory = categories.find(cat => cat.id === selectedValue)
    if (selectedCategory) {
      onChange(selectedCategory.id, selectedCategory.name)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className={`cursor-pointer ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem 
              key={category.id} 
              value={category.id} 
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{category.name}</span>
                {!category.isDefault && (
                  <span className="text-xs text-muted-foreground ml-2">(Custom)</span>
                )}
              </div>
            </SelectItem>
          ))}
          
          {/* Separador e opção para adicionar nova categoria */}
          <div className="border-t my-1" />
          <SelectItem value="__ADD_NEW__" className="cursor-pointer text-blue-600">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>Add new category</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Modal para criar nova categoria */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New {type} Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="category-name"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleCreateCategory()
                  }
                }}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setNewCategoryName('')
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 