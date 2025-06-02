import { useLanguage } from '@/components/providers/language-provider'
import { useTranslation } from '@/app/i18n/client'
import { ICategory } from '@/interfaces/ICategory'

interface UseCategoryTranslationReturn {
  translateCategory: (category: ICategory) => string
  translateCategoryName: (categoryName: string, isDefault?: boolean) => string
}

export function useCategoryTranslation(): UseCategoryTranslationReturn {
  const { userLocale } = useLanguage()
  const { t } = useTranslation(userLocale, 'categories')

  const translateCategory = (category: ICategory): string => {
    // Se é categoria padrão, traduzir
    if (category.isDefault) {
      const translated = t(`categories.${category.name}`)
      // Se a tradução retornar a chave (sem tradução), usar o nome original
      return translated.startsWith('categories.') ? category.name : translated
    }
    
    // Se é categoria customizada, manter nome original
    return category.name
  }

  const translateCategoryName = (categoryName: string, isDefault: boolean = false): string => {
    // Se é categoria padrão, traduzir
    if (isDefault) {
      const translated = t(`categories.${categoryName}`)
      // Se a tradução retornar a chave (sem tradução), usar o nome original
      return translated.startsWith('categories.') ? categoryName : translated
    }
    
    // Se é categoria customizada, manter nome original
    return categoryName
  }

  return {
    translateCategory,
    translateCategoryName
  }
} 