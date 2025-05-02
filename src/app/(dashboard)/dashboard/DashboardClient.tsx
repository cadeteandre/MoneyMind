"use client";

import { useEffect, useState } from "react";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@prisma/client";
import { getTransactions } from "@/app/actions/getTransactions";
import { TransactionStats, getTransactionStats } from "@/app/actions/getTransactionStats";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import FinancialSummary from "@/components/FinancialSummary";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm";
import { X } from "lucide-react";

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    byCategory: [],
    byMonth: []
  });
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});

  const fetchData = async (startDate?: Date, endDate?: Date) => {
    try {
      // Prepare date parameters
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      // Fetch transactions and stats
      const [transactionsData, statsData] = await Promise.all([
        getTransactions(params),
        getTransactionStats(params)
      ]);
      
      setTransactions(transactionsData);
      setStats(statsData);
      setDateRange({ startDate, endDate });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearFilters = () => {
    fetchData(undefined, undefined);
  };

  const hasActiveFilters = dateRange.startDate || dateRange.endDate;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={() => { fetchData(); setIsModalOpen(false); }} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DateRangeFilter onFilter={fetchData} />
      
      <FinancialSummary stats={stats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpensePieChart data={stats.byCategory} />
        <MonthlyBarChart data={stats.byMonth} />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <TransactionList 
          transactions={transactions.slice(0, 5)} 
          onTransactionUpdated={fetchData}
        />
      </div>
    </div>
  );
}
