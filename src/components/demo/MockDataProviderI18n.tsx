"use client";

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { useTranslation } from '@/app/i18n/client';
import {
  getLocalizedMockData,
  calculateLocalizedMetrics,
  getLocalizedTransactionsByDateRange,
  getLocalizedTransactionsByCategory,
  getLocalizedTransactionsByType,
  getLocalizedMonthlyChartData,
  getLocalizedCategoryChartData,
  MockMetricsI18n
} from '@/lib/mock-data-i18n';

// Types for localized data
interface LocalizedTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

interface LocalizedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
  language: string;
  createdAt: string;
}

interface LocalizedCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

interface MockDataContextType {
  // Localized data
  user: LocalizedUser;
  transactions: LocalizedTransaction[];
  categories: LocalizedCategory[];
  metrics: MockMetricsI18n;
  
  // Helper functions
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => LocalizedTransaction[];
  getTransactionsByCategory: (categoryKey: string) => LocalizedTransaction[];
  getTransactionsByType: (type: 'income' | 'expense') => LocalizedTransaction[];
  getMonthlyChartData: () => Array<{ month: string; income: number; expenses: number }>;
  getCategoryChartData: () => Array<{ category: string; amount: number; color: string }>;
  
  // State helpers
  isDemo: boolean;
  locale: string;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

interface MockDataProviderProps {
  children: ReactNode;
}

export function MockDataProviderI18n({ children }: MockDataProviderProps) {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'mock-data');

  // Memoize localized data to avoid unnecessary recalculations
  const localizedData = useMemo(() => {
    return getLocalizedMockData(userLocale, t);
  }, [userLocale, t]);

  const metrics = useMemo(() => {
    return calculateLocalizedMetrics(userLocale, t);
  }, [userLocale, t]);

  const contextValue: MockDataContextType = useMemo(() => ({
    // Localized data
    user: localizedData.user,
    transactions: localizedData.transactions,
    categories: localizedData.categories,
    metrics,
    
    // Helper functions
    getTransactionsByDateRange: (startDate: Date, endDate: Date) => 
      getLocalizedTransactionsByDateRange(startDate, endDate, userLocale, t),
    getTransactionsByCategory: (categoryKey: string) => 
      getLocalizedTransactionsByCategory(categoryKey, userLocale, t),
    getTransactionsByType: (type: 'income' | 'expense') => 
      getLocalizedTransactionsByType(type, userLocale, t),
    getMonthlyChartData: () => getLocalizedMonthlyChartData(userLocale),
    getCategoryChartData: () => getLocalizedCategoryChartData(userLocale, t),
    
    // State helpers
    isDemo: true,
    locale: userLocale,
  }), [localizedData, metrics, userLocale, t]);

  return (
    <MockDataContext.Provider value={contextValue}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProviderI18n');
  }
  return context;
}

// Hook to check if we're in demo mode
export function useIsDemo() {
  const context = useContext(MockDataContext);
  return context?.isDemo ?? false;
}

// Hook to get current demo locale
export function useDemoLocale() {
  const context = useContext(MockDataContext);
  return context?.locale ?? 'en';
} 