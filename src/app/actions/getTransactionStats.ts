"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export type CategorySummary = {
  category: string;
  total: number;
  count: number;
};

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export type TransactionStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategorySummary[];
  byMonth: MonthlyData[];
};

export async function getTransactionStats({
  startDate,
  endDate
}: {
  startDate?: string;
  endDate?: string;
}): Promise<TransactionStats> {
  const { userId } = await auth();

  if (!userId) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      byCategory: [],
      byMonth: []
    };
  }

  const where = {
    userId,
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  // Get all transactions based on filter
  const transactionsRaw = await prisma.transaction.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // Converter amount para number e garantir que date seja sempre um Date
  const transactions = transactionsRaw.map(t => ({
    ...t,
    amount:
      typeof t.amount === 'string'
        ? parseFloat(t.amount)
        : typeof t.amount === 'object' && t.amount !== null && 'toNumber' in t.amount
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (t.amount as any).toNumber()
        : Number(t.amount),
    date: new Date(t.date) // Garantir que date seja sempre um Date
  }));

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Aggregate by category (for expense categories only)
  const expensesByCategory = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc: Record<string, { total: number; count: number }>, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { total: 0, count: 0 };
      }
      acc[t.category].total += t.amount;
      acc[t.category].count += 1;
      return acc;
    }, {});

  const byCategory = Object.entries(expensesByCategory).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
  })).sort((a, b) => b.total - a.total);

  // Aggregate by month
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    
    if (t.type === "INCOME") {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  });

  const byMonth = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => {
      // Sort by date (assuming month format is "MMM YYYY")
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
    byMonth,
  };
} 