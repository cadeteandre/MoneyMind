import type { ITransaction } from "@/interfaces/ITransaction";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CurrencyConfig = {
  code: string;
  locale: string;
}

export const CURRENCY_OPTIONS: Record<string, CurrencyConfig> = {
  EUR: { code: 'EUR', locale: 'de-DE' },
  USD: { code: 'USD', locale: 'en-US' },
  GBP: { code: 'GBP', locale: 'en-GB' },
  BRL: { code: 'BRL', locale: 'pt-BR' },
  JPY: { code: 'JPY', locale: 'ja-JP' },
  CNY: { code: 'CNY', locale: 'zh-CN' },
  INR: { code: 'INR', locale: 'en-IN' },
};

export function formatCurrency(amount: number | string, currency: string = 'EUR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currencyConfig = CURRENCY_OPTIONS[currency] || CURRENCY_OPTIONS.EUR;
  
  return new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.code,
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