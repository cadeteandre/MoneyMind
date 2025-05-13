import type { ITransaction } from "@/interfaces/ITransaction";
import { DateRangeFilter } from "./DateRangeFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { useState } from "react";
import { X } from "lucide-react";

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
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Select a period to analyze your data</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactions.length > 0 ? (
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />) : null}
            
            <Select value={typeFilter} onValueChange={(value: "ALL" | "INCOME" | "EXPENSE") => setTypeFilter(value)}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">All Types</SelectItem>
                <SelectItem value="INCOME" className="cursor-pointer">Income</SelectItem>
                <SelectItem value="EXPENSE" className="cursor-pointer">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="cursor-pointer">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 mb-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Date Range</h3>
              {(activeFilter || showCustomDateRange) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearDateFilters} 
                  className="h-6 px-2 text-xs flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
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
                This Month
              </Button>
              <Button 
                variant={activeFilter === 'last-month' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-month')}
                className="text-xs"
              >
                Last Month
              </Button>
              <Button 
                variant={activeFilter === 'last-3-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-3-months')}
                className="text-xs"
              >
                Last 3 Months
              </Button>
              <Button 
                variant={activeFilter === 'last-6-months' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-6-months')}
                className="text-xs"
              >
                Last 6 Months
              </Button>
              <Button 
                variant={activeFilter === 'this-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('this-year')}
                className="text-xs"
              >
                This Year
              </Button>
              <Button 
                variant={activeFilter === 'last-year' ? "default" : "outline"} 
                size="sm" 
                onClick={() => applyQuickFilter('last-year')}
                className="text-xs"
              >
                Last Year
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
                Custom Range
              </Button>
            </div>
          </div>
          
          {showCustomDateRange && <DateRangeFilter onFilter={fetchData} />}
        </CardContent>
      </Card>
    );
}
 
export default FilterContainer;