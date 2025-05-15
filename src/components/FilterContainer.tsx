import type { ITransaction } from "@/interfaces/ITransaction";
import { DateRangeFilter } from "./DateRangeFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "./providers/language-provider";

// Traduções para o FilterContainer
const translations = {
  pt: {
    filters: 'Filtros',
    selectPeriod: 'Selecione um período para analisar seus dados',
    searchTransactions: 'Buscar transações...',
    filterByType: 'Filtrar por tipo',
    allTypes: 'Todos os Tipos',
    income: 'Receita',
    expense: 'Despesa',
    filterByCategory: 'Filtrar por categoria',
    allCategories: 'Todas as Categorias',
    dateRange: 'Período',
    clear: 'Limpar',
    thisMonth: 'Este Mês',
    lastMonth: 'Mês Passado',
    last3Months: 'Últimos 3 Meses',
    last6Months: 'Últimos 6 Meses',
    thisYear: 'Este Ano',
    lastYear: 'Ano Passado',
    customRange: 'Período Personalizado'
  },
  en: {
    filters: 'Filters',
    selectPeriod: 'Select a period to analyze your data',
    searchTransactions: 'Search transactions...',
    filterByType: 'Filter by type',
    allTypes: 'All Types',
    income: 'Income',
    expense: 'Expense',
    filterByCategory: 'Filter by category',
    allCategories: 'All Categories',
    dateRange: 'Date Range',
    clear: 'Clear',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last3Months: 'Last 3 Months',
    last6Months: 'Last 6 Months',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    customRange: 'Custom Range'
  },
  es: {
    filters: 'Filtros',
    selectPeriod: 'Seleccione un período para analizar sus datos',
    searchTransactions: 'Buscar transacciones...',
    filterByType: 'Filtrar por tipo',
    allTypes: 'Todos los Tipos',
    income: 'Ingreso',
    expense: 'Gasto',
    filterByCategory: 'Filtrar por categoría',
    allCategories: 'Todas las Categorías',
    dateRange: 'Rango de Fechas',
    clear: 'Borrar',
    thisMonth: 'Este Mes',
    lastMonth: 'Mes Pasado',
    last3Months: 'Últimos 3 Meses',
    last6Months: 'Últimos 6 Meses',
    thisYear: 'Este Año',
    lastYear: 'Año Pasado',
    customRange: 'Rango Personalizado'
  },
  de: {
    filters: 'Filter',
    selectPeriod: 'Wählen Sie einen Zeitraum zur Analyse Ihrer Daten',
    searchTransactions: 'Transaktionen suchen...',
    filterByType: 'Nach Typ filtern',
    allTypes: 'Alle Typen',
    income: 'Einkommen',
    expense: 'Ausgabe',
    filterByCategory: 'Nach Kategorie filtern',
    allCategories: 'Alle Kategorien',
    dateRange: 'Datumsbereich',
    clear: 'Löschen',
    thisMonth: 'Dieser Monat',
    lastMonth: 'Letzter Monat',
    last3Months: 'Letzte 3 Monate',
    last6Months: 'Letzte 6 Monate',
    thisYear: 'Dieses Jahr',
    lastYear: 'Letztes Jahr',
    customRange: 'Benutzerdefinierter Bereich'
  }
};

interface FilterContainerProps {
    transactions: ITransaction[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    typeFilter: "ALL" | "INCOME" | "EXPENSE";
    setTypeFilter: (value: "ALL" | "INCOME" | "EXPENSE") => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    categories: string[];
    fetchData: (startDate?: Date, endDate?: Date) => void;
}

const FilterContainer = ({ transactions, searchTerm, setSearchTerm, typeFilter, setTypeFilter, categoryFilter, setCategoryFilter, categories, fetchData }: FilterContainerProps) => {
    const [showCustomDateRange, setShowCustomDateRange] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const { userLocale } = useLanguage();
    
    // Selecionar a tradução correta com fallback para inglês
    const t = translations[userLocale as keyof typeof translations] || translations.en;

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
    };

    const clearDateFilters = () => {
        fetchData(undefined, undefined);
        setActiveFilter(null);
        setShowCustomDateRange(false);
    };

    return (  
        <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t.filters}</CardTitle>
          <CardDescription>{t.selectPeriod}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactions.length > 0 ? (
            <Input
              placeholder={t.searchTransactions}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />) : null}
            
            <Select value={typeFilter} onValueChange={(value: "ALL" | "INCOME" | "EXPENSE") => setTypeFilter(value)}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t.filterByType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">{t.allTypes}</SelectItem>
                <SelectItem value="INCOME" className="cursor-pointer">{t.income}</SelectItem>
                <SelectItem value="EXPENSE" className="cursor-pointer">{t.expense}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t.filterByCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">{t.allCategories}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="cursor-pointer">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 mb-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{t.dateRange}</h3>
              {(activeFilter || showCustomDateRange) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearDateFilters} 
                  className="h-6 px-2 text-xs flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> {t.clear}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === 'this-month' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('this-month')}
                className="text-xs"
              >
                {t.thisMonth}
              </Button>
              <Button 
                variant={activeFilter === 'last-month' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-month')}
                className="text-xs"
              >
                {t.lastMonth}
              </Button>
              <Button 
                variant={activeFilter === 'last-3-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-3-months')}
                className="text-xs"
              >
                {t.last3Months}
              </Button>
              <Button 
                variant={activeFilter === 'last-6-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-6-months')}
                className="text-xs"
              >
                {t.last6Months}
              </Button>
              <Button 
                variant={activeFilter === 'this-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('this-year')}
                className="text-xs"
              >
                {t.thisYear}
              </Button>
              <Button 
                variant={activeFilter === 'last-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-year')}
                className="text-xs"
              >
                {t.lastYear}
              </Button>
              <Button 
                variant={showCustomDateRange ? "default" : "outline"} 
                size="sm" 
                onClick={() => {
                  setShowCustomDateRange(!showCustomDateRange);
                  if (!showCustomDateRange) {
                    setActiveFilter(null);
                  }
                }}
                className="text-xs"
              >
                {t.customRange}
              </Button>
            </div>
          </div>
          
          {showCustomDateRange && <DateRangeFilter onFilter={fetchData} />}
        </CardContent>
      </Card>
    );
}
 
export default FilterContainer;