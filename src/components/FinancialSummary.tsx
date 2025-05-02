"use client";

import { TransactionStats } from "@/app/actions/getTransactionStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, ScaleIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummaryProps {
  stats: TransactionStats;
}

export default function FinancialSummary({ stats }: FinancialSummaryProps) {
  const { totalIncome, totalExpense, balance } = stats;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(totalExpense)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <ScaleIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 