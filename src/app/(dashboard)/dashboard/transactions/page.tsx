"use client";

import { useEffect, useState } from "react";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@prisma/client";
import { getTransactions } from "@/app/actions/getTransactions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm";
import { Calendar, Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import FilterContainer from "@/components/FilterContainer";

export default function TransactionsPage() {
  const [isTransactionsHeaderModalOpen, setIsTransactionsHeaderModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionsEmptyModalOpen, setIsTransactionsEmptyModalOpen] = useState(false);

  const fetchData = async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
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

      {/* Filtros */}
      <FilterContainer
        transactions={transactions}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        fetchData={fetchData}
      />
        
      {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first transaction to start tracking your finances.
            </p>
            <Dialog 
              open={isTransactionsEmptyModalOpen} 
              modal={true}
              onOpenChange={(open) => {
                // Se estiver tentando abrir, permitir
                if (open) {
                  setIsTransactionsEmptyModalOpen(true);
                  return;
                }
                // Se estiver tentando fechar, impedir
                return;
              }}
            >
              <DialogTrigger asChild>
                <Button className="mt-4 cursor-pointer">
                  Add Transaction
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
                      onClick={() => setIsTransactionsEmptyModalOpen(false)}
                    >
                      ×
                    </Button>
                  </div>
                </DialogHeader>
                <TransactionForm
                  onSuccess={() => {
                    fetchData()
                    setIsTransactionsEmptyModalOpen(false)
                  }}
                  onClose={() => setIsTransactionsEmptyModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-4">
            <TransactionList
              transactions={filteredTransactions}
              onTransactionUpdated={() => fetchData()}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
  );
}
