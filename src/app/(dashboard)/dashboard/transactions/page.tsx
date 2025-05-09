"use client";

import { useEffect, useState } from "react";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@prisma/client";
import { getTransactions } from "@/app/actions/getTransactions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export default function TransactionsPage() {
  const [isTransactionsHeaderModalOpen, setIsTransactionsHeaderModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});

  const fetchData = async (startDate?: Date, endDate?: Date) => {
    try {
      // Prepare date parameters
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      const transactionsData = await getTransactions(params);
      setTransactions(transactionsData);
      setDateRange({ startDate, endDate });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === "ALL" || transaction.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    fetchData(undefined, undefined);
  };

  const hasActiveFilters = searchTerm || typeFilter !== "ALL" || categoryFilter !== "ALL" || dateRange.startDate || dateRange.endDate;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearAllFilters} className="gap-2 cursor-pointer">
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
          <Dialog 
            open={isTransactionsHeaderModalOpen} 
            modal={true}
            onOpenChange={(open) => {
              // Se estiver tentando abrir, permitir
              if (open) {
                setIsTransactionsHeaderModalOpen(true);
                return;
              }
              // Se estiver tentando fechar, impedir
              return;
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-md"
              onPointerDownOutside={e => e.preventDefault()}
              onInteractOutside={e => e.preventDefault()}
              onEscapeKeyDown={e => e.preventDefault()}
            >
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full cursor-pointer" 
                    onClick={() => setIsTransactionsHeaderModalOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              </DialogHeader>
              <TransactionForm
                onSuccess={() => {
                  fetchData()
                  setIsTransactionsHeaderModalOpen(false)
                }}
                onClose={() => setIsTransactionsHeaderModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DateRangeFilter onFilter={fetchData} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
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
      </div>
      
      <TransactionList 
        transactions={filteredTransactions} 
        onTransactionUpdated={fetchData}
      />
    </div>
  );
}
