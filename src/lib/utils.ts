import type { ITransaction } from "@/interfaces/ITransaction";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

export const handleClearAllFilters = (setSearchTerm: (value: string) => void, setTypeFilter: (value: "ALL" | "INCOME" | "EXPENSE") => void, setCategoryFilter: (value: string) => void, fetchData: (startDate?: Date, endDate?: Date) => void) => {
  setSearchTerm("");
  setTypeFilter("ALL");
  setCategoryFilter("ALL");
  fetchData(undefined, undefined);
};

export const filteredTransactions = (transactions: ITransaction[], searchTerm: string, typeFilter: "ALL" | "INCOME" | "EXPENSE", categoryFilter: string): ITransaction[] => {
  return transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === "ALL" || transaction.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });
};

export const categories = (transactions: ITransaction[]): string[] => {
  return Array.from(new Set(transactions.map(t => t.category)));
};

export const hasActiveFilters = (searchTerm: string, typeFilter: "ALL" | "INCOME" | "EXPENSE", categoryFilter: string): boolean => {
  if (searchTerm || typeFilter !== "ALL" || categoryFilter !== "ALL") {
    return true;
  }
  return false;
};