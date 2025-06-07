import type { ITransaction } from "@/interfaces/ITransaction";
import { DateRangeFilter } from "./DateRangeFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { handleClearAllFilters, hasActiveFilters } from "@/lib/utils";
import { useCategories } from '@/hooks/useCategories';
import { useCategoryTranslation } from '@/hooks/useCategoryTranslation';

interface FilterContainerProps {
    transactions: ITransaction[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    typeFilter: "ALL" | "INCOME" | "EXPENSE";
    setTypeFilter: (value: "ALL" | "INCOME" | "EXPENSE") => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    fetchData: (startDate?: Date, endDate?: Date) => void;
    hasDateFilter?: boolean;
    onDateFilterChange?: (hasFilter: boolean) => void;
}

const FilterContainer = ({ 
    transactions, 
    searchTerm, 
    setSearchTerm, 
    typeFilter, 
    setTypeFilter, 
    categoryFilter, 
    setCategoryFilter, 
    fetchData, 
    hasDateFilter = false,
    onDateFilterChange 
}: FilterContainerProps) => {
    const [showCustomDateRange, setShowCustomDateRange] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const { userLocale } = useLanguage();
    const { t } = useTranslation(userLocale, 'filters');
    
    // Buscar todas as categorias do banco para tradução
    const { categories: allCategories } = useCategories({ type: 'ALL' });
    const { translateCategory } = useCategoryTranslation();

    // Extrair apenas categorias que aparecem nas transações do usuário
    const usedCategoryNames = Array.from(new Set(transactions.map(t => t.category)));
    
    // Criar lista de categorias disponíveis baseada apenas nas transações
    const availableCategories = usedCategoryNames.map(categoryName => {
        // Procurar se existe no banco (para saber se é padrão)
        const categoryFromBank = allCategories.find(cat => cat.name === categoryName);
        
        if (categoryFromBank) {
            // Se existe no banco, usar dados do banco
            return categoryFromBank;
        } else {
            // Se não existe no banco, criar objeto para compatibilidade (categoria antiga)
            return {
                id: categoryName,
                name: categoryName,
                type: 'EXPENSE' as const,
                isDefault: false,
                userId: '',
                createdAt: new Date()
            };
        }
    });

    const applyQuickFilter = (filter: string) => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date();
        
        switch(filter) {
            case 'this-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last-3-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'last-6-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case 'this-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'last-year':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear(), 0, 0);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        fetchData(startDate, endDate);
        setShowCustomDateRange(false);
        setActiveFilter(filter);
        if (onDateFilterChange) onDateFilterChange(true);
    };

    const clearDateFilters = () => {
        fetchData(undefined, undefined);
        setActiveFilter(null);
        setShowCustomDateRange(false);
        if (onDateFilterChange) onDateFilterChange(false);
    };

    return (  
        <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t('filters')}</CardTitle>
          <CardDescription>{t('selectPeriod')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactions.length > 0 ? (
            <Input
              placeholder={t('searchTransactions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />) : null}
            
            <Select value={typeFilter} onValueChange={(value: "ALL" | "INCOME" | "EXPENSE") => setTypeFilter(value)}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t('filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">{t('allTypes')}</SelectItem>
                <SelectItem value="INCOME" className="cursor-pointer">{t('income')}</SelectItem>
                <SelectItem value="EXPENSE" className="cursor-pointer">{t('expense')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t('filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">{t('allCategories')}</SelectItem>
                {availableCategories
                  .sort((a, b) => translateCategory(a).localeCompare(translateCategory(b)))
                  .map(category => (
                    <SelectItem key={category.id} value={category.name} className="cursor-pointer">
                      {translateCategory(category)}
                      {!category.isDefault && (
                        <span className="text-xs text-muted-foreground ml-2">{t('customLabel')}</span>
                      )}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 mb-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{t('dateRange')}</h3>
              {hasActiveFilters(searchTerm, typeFilter, categoryFilter, hasDateFilter) && (
            <Button variant="outline" size="sm" onClick={() => handleClearAllFilters(setSearchTerm, setTypeFilter, setCategoryFilter, fetchData, clearDateFilters)} className="h-9 cursor-pointer">
              <X className="h-4 w-4 mr-2" />
              {t('clearFilters')}
            </Button>
          )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === 'this-month' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('this-month')}
                className="text-xs cursor-pointer"
              >
                {t('thisMonth')}
              </Button>
              <Button 
                variant={activeFilter === 'last-month' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-month')}
                className="text-xs cursor-pointer"
              >
                {t('lastMonth')}
              </Button>
              <Button 
                variant={activeFilter === 'last-3-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-3-months')}
                className="text-xs cursor-pointer"
              >
                {t('last3Months')}
              </Button>
              <Button 
                variant={activeFilter === 'last-6-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-6-months')}
                className="text-xs cursor-pointer"
              >
                {t('last6Months')}
              </Button>
              <Button 
                variant={activeFilter === 'this-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('this-year')}
                className="text-xs cursor-pointer"
              >
                {t('thisYear')}
              </Button>
              <Button 
                variant={activeFilter === 'last-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-year')}
                className="text-xs cursor-pointer"
              >
                {t('lastYear')}
              </Button>
              <Button 
                variant={showCustomDateRange ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowCustomDateRange(!showCustomDateRange)}
                className="text-xs cursor-pointer"
              >
                {t('customRange')}
              </Button>
            </div>
            {showCustomDateRange && (
               <div className="mt-4">
               <DateRangeFilter onFilter={(start, end) => {
                 if (start && end) {
                   fetchData(start, end);
                   setActiveFilter(null);
                   if (onDateFilterChange) onDateFilterChange(true);
                 }
               }} />
             </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
}
 
export default FilterContainer;