import { Locale } from '@/app/i18n/settings';

// Interfaces with i18n support
export interface MockTransactionI18n {
  id: string;
  amount: number;
  descriptionKey: string;
  categoryKey: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

export interface MockUserI18n {
  id: string;
  nameKey: string;
  email: string;
  avatar: string;
  currency: string;
  language: string;
  createdAt: string;
}

export interface MockCategoryI18n {
  id: string;
  nameKey: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface MockMetricsI18n {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  transactionCount: number;
  topCategoryKey: string;
}

// Base mock data structure with translation keys
export const baseMockData = {
  user: {
    id: 'demo-user-1',
    nameKey: 'user.name',
    email: 'mary.jane@example.com',
    avatar: '/images/avatar-mary-jane.jpg',
    currency: 'EUR',
    language: 'en',
    createdAt: '2024-01-15T10:00:00Z'
  },

  categories: [
    // Income categories
    { id: 'cat-1', nameKey: 'categories.income.salary', color: '#10B981', icon: '💼', type: 'income' as const },
    { id: 'cat-2', nameKey: 'categories.income.freelance', color: '#8B5CF6', icon: '💻', type: 'income' as const },
    { id: 'cat-3', nameKey: 'categories.income.investments', color: '#06B6D4', icon: '📈', type: 'income' as const },
    { id: 'cat-4', nameKey: 'categories.income.sales', color: '#F59E0B', icon: '🛍️', type: 'income' as const },
    
    // Expense categories
    { id: 'cat-5', nameKey: 'categories.expense.food', color: '#EF4444', icon: '🍽️', type: 'expense' as const },
    { id: 'cat-6', nameKey: 'categories.expense.transportation', color: '#F97316', icon: '🚗', type: 'expense' as const },
    { id: 'cat-7', nameKey: 'categories.expense.housing', color: '#84CC16', icon: '🏠', type: 'expense' as const },
    { id: 'cat-8', nameKey: 'categories.expense.healthcare', color: '#EC4899', icon: '🏥', type: 'expense' as const },
    { id: 'cat-9', nameKey: 'categories.expense.education', color: '#6366F1', icon: '📚', type: 'expense' as const },
    { id: 'cat-10', nameKey: 'categories.expense.entertainment', color: '#14B8A6', icon: '🎮', type: 'expense' as const },
    { id: 'cat-11', nameKey: 'categories.expense.shopping', color: '#F43F5E', icon: '🛒', type: 'expense' as const },
    { id: 'cat-12', nameKey: 'categories.expense.services', color: '#64748B', icon: '🔧', type: 'expense' as const }
  ],

  transactions: [
    // Recent transactions (this month)
    {
      id: 'txn-1',
      amount: 5500.00,
      descriptionKey: 'transactions.descriptions.salary_jan',
      categoryKey: 'categories.income.salary',
      type: 'income' as const,
      date: '2024-01-01T09:00:00Z',
      createdAt: '2024-01-01T09:00:00Z'
    },
    {
      id: 'txn-2',
      amount: -1200.00,
      descriptionKey: 'transactions.descriptions.rent_apartment',
      categoryKey: 'categories.expense.housing',
      type: 'expense' as const,
      date: '2024-01-05T14:30:00Z',
      createdAt: '2024-01-05T14:30:00Z'
    },
    {
      id: 'txn-3',
      amount: -85.50,
      descriptionKey: 'transactions.descriptions.supermarket',
      categoryKey: 'categories.expense.food',
      type: 'expense' as const,
      date: '2024-01-10T18:45:00Z',
      createdAt: '2024-01-10T18:45:00Z'
    },
    {
      id: 'txn-4',
      amount: 1200.00,
      descriptionKey: 'transactions.descriptions.freelance_website',
      categoryKey: 'categories.income.freelance',
      type: 'income' as const,
      date: '2024-01-12T11:20:00Z',
      createdAt: '2024-01-12T11:20:00Z'
    },
    {
      id: 'txn-5',
      amount: -45.90,
      descriptionKey: 'transactions.descriptions.gas_station',
      categoryKey: 'categories.expense.transportation',
      type: 'expense' as const,
      date: '2024-01-15T16:10:00Z',
      createdAt: '2024-01-15T16:10:00Z'
    },
    {
      id: 'txn-6',
      amount: -120.00,
      descriptionKey: 'transactions.descriptions.medical_consultation',
      categoryKey: 'categories.expense.healthcare',
      type: 'expense' as const,
      date: '2024-01-18T10:30:00Z',
      createdAt: '2024-01-18T10:30:00Z'
    },
    {
      id: 'txn-7',
      amount: -89.90,
      descriptionKey: 'transactions.descriptions.streaming',
      categoryKey: 'categories.expense.entertainment',
      type: 'expense' as const,
      date: '2024-01-20T20:15:00Z',
      createdAt: '2024-01-20T20:15:00Z'
    },
    {
      id: 'txn-8',
      amount: -250.00,
      descriptionKey: 'transactions.descriptions.online_course',
      categoryKey: 'categories.expense.education',
      type: 'expense' as const,
      date: '2024-01-22T13:45:00Z',
      createdAt: '2024-01-22T13:45:00Z'
    },
    {
      id: 'txn-9',
      amount: 350.00,
      descriptionKey: 'transactions.descriptions.stock_dividends',
      categoryKey: 'categories.income.investments',
      type: 'income' as const,
      date: '2024-01-25T09:00:00Z',
      createdAt: '2024-01-25T09:00:00Z'
    },
    {
      id: 'txn-10',
      amount: -156.78,
      descriptionKey: 'transactions.descriptions.pharmacy',
      categoryKey: 'categories.expense.healthcare',
      type: 'expense' as const,
      date: '2024-01-28T19:20:00Z',
      createdAt: '2024-01-28T19:20:00Z'
    },

    // Previous months transactions (sample)
    {
      id: 'txn-11',
      amount: 5500.00,
      descriptionKey: 'transactions.descriptions.salary_dec',
      categoryKey: 'categories.income.salary',
      type: 'income' as const,
      date: '2023-12-01T09:00:00Z',
      createdAt: '2023-12-01T09:00:00Z'
    },
    {
      id: 'txn-12',
      amount: -1200.00,
      descriptionKey: 'transactions.descriptions.rent_dec',
      categoryKey: 'categories.expense.housing',
      type: 'expense' as const,
      date: '2023-12-05T14:30:00Z',
      createdAt: '2023-12-05T14:30:00Z'
    },
    {
      id: 'txn-13',
      amount: -450.00,
      descriptionKey: 'transactions.descriptions.christmas_gifts',
      categoryKey: 'categories.expense.shopping',
      type: 'expense' as const,
      date: '2023-12-20T16:45:00Z',
      createdAt: '2023-12-20T16:45:00Z'
    },
    {
      id: 'txn-14',
      amount: 800.00,
      descriptionKey: 'transactions.descriptions.freelance_logo',
      categoryKey: 'categories.income.freelance',
      type: 'income' as const,
      date: '2023-12-15T14:20:00Z',
      createdAt: '2023-12-15T14:20:00Z'
    },
    {
      id: 'txn-15',
      amount: -280.50,
      descriptionKey: 'transactions.descriptions.restaurant_dinner',
      categoryKey: 'categories.expense.food',
      type: 'expense' as const,
      date: '2023-12-31T21:30:00Z',
      createdAt: '2023-12-31T21:30:00Z'
    },

    // November 2023
    {
      id: 'txn-16',
      amount: 5500.00,
      descriptionKey: 'transactions.descriptions.salary_nov',
      categoryKey: 'categories.income.salary',
      type: 'income' as const,
      date: '2023-11-01T09:00:00Z',
      createdAt: '2023-11-01T09:00:00Z'
    },
    {
      id: 'txn-17',
      amount: -1200.00,
      descriptionKey: 'transactions.descriptions.rent_nov',
      categoryKey: 'categories.expense.housing',
      type: 'expense' as const,
      date: '2023-11-05T14:30:00Z',
      createdAt: '2023-11-05T14:30:00Z'
    },
    {
      id: 'txn-18',
      amount: -98.00,
      descriptionKey: 'transactions.descriptions.car_maintenance',
      categoryKey: 'categories.expense.transportation',
      type: 'expense' as const,
      date: '2023-11-12T10:15:00Z',
      createdAt: '2023-11-12T10:15:00Z'
    },
    {
      id: 'txn-19',
      amount: 1500.00,
      descriptionKey: 'transactions.descriptions.freelance_app',
      categoryKey: 'categories.income.freelance',
      type: 'income' as const,
      date: '2023-11-18T16:30:00Z',
      createdAt: '2023-11-18T16:30:00Z'
    },
    {
      id: 'txn-20',
      amount: -67.90,
      descriptionKey: 'transactions.descriptions.online_shopping',
      categoryKey: 'categories.expense.shopping',
      type: 'expense' as const,
      date: '2023-11-25T20:45:00Z',
      createdAt: '2023-11-25T20:45:00Z'
    }
  ]
};

// Function to get localized mock data
export function getLocalizedMockData(locale: Locale, t: (key: string) => string) {
  return {
    user: {
      ...baseMockData.user,
      name: t(baseMockData.user.nameKey),
      language: locale
    },
    categories: baseMockData.categories.map(cat => ({
      ...cat,
      name: t(cat.nameKey)
    })),
    transactions: baseMockData.transactions.map(txn => ({
      ...txn,
      description: t(txn.descriptionKey),
      category: t(txn.categoryKey)
    }))
  };
}

// Calculate metrics based on localized data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateLocalizedMetrics(_locale: Locale, _t: (key: string) => string): MockMetricsI18n {
  // Use all transactions for demo metrics (more realistic)
  const allTransactions = baseMockData.transactions;
  
  // Calculate totals from all transactions
  const totalIncome = allTransactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = Math.abs(allTransactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0));

  const totalBalance = allTransactions.reduce((sum, txn) => sum + txn.amount, 0);

  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Find top category by expense amount
  const categoryExpenses: { [key: string]: number } = {};
  allTransactions
    .filter(txn => txn.type === 'expense')
    .forEach(txn => {
      categoryExpenses[txn.categoryKey] = (categoryExpenses[txn.categoryKey] || 0) + Math.abs(txn.amount);
    });

  const topCategoryKey = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'categories.expense.food';

  return {
    totalBalance,
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    savingsRate: Math.round(savingsRate * 100) / 100,
    transactionCount: allTransactions.length,
    topCategoryKey
  };
}

// Helper functions for localized demo data
export function getLocalizedTransactionsByDateRange(
  startDate: Date, 
  endDate: Date, 
  _locale: Locale, 
  t: (key: string) => string
) {
  const filtered = baseMockData.transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate >= startDate && txnDate <= endDate;
  });

  return filtered.map(txn => ({
    ...txn,
    description: t(txn.descriptionKey),
    category: t(txn.categoryKey)
  }));
}

export function getLocalizedTransactionsByCategory(
  categoryKey: string, 
  _locale: Locale, 
  t: (key: string) => string
) {
  const filtered = baseMockData.transactions.filter(txn => txn.categoryKey === categoryKey);
  
  return filtered.map(txn => ({
    ...txn,
    description: t(txn.descriptionKey),
    category: t(txn.categoryKey)
  }));
}

export function getLocalizedTransactionsByType(
  type: 'income' | 'expense', 
  _locale: Locale, 
  t: (key: string) => string
) {
  const filtered = baseMockData.transactions.filter(txn => txn.type === type);
  
  return filtered.map(txn => ({
    ...txn,
    description: t(txn.descriptionKey),
    category: t(txn.categoryKey)
  }));
}

// Chart data helpers with localization
export function getLocalizedMonthlyChartData(locale: Locale) {
  // Month names based on locale
  const monthNames = {
    pt: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'],
    en: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    es: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'],
    de: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan']
  };

  const months = monthNames[locale] || monthNames.en;
  
  // Fixed deterministic data to avoid hydration mismatch
  const fixedData = [6500, 4200, 5800, 4900, 6100, 5500, 7000];
  const fixedExpenses = [3200, 2800, 3500, 3100, 2900, 3400, 3800];
  
  return months.map((month, index) => ({
    month,
    income: fixedData[index] || 5000,
    expenses: fixedExpenses[index] || 3000,
  }));
}

export function getLocalizedCategoryChartData(locale: Locale, t: (key: string) => string) {
  // Fixed amounts to avoid hydration mismatch
  const fixedAmounts = [850, 720, 650, 580, 490, 420];
  
  return baseMockData.categories
    .filter(cat => cat.type === 'expense')
    .slice(0, 6) // Top 6 categories
    .map((cat, index) => ({
      category: t(cat.nameKey),
      amount: fixedAmounts[index] || 500,
      color: cat.color
    }));
} 