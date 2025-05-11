import { Transaction } from "@prisma/client";
import { DateRangeFilter } from "./DateRangeFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface FilterContainerProps {
    transactions: Transaction[];
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
          <DateRangeFilter onFilter={fetchData} />
        </CardContent>
      </Card>
    );
}
 
export default FilterContainer;