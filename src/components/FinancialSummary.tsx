"use client";

import { TransactionStats } from "@/app/actions/getTransactionStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, ScaleIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "./providers/currency-provider";
import { useLanguage } from "./providers/language-provider";

// Traduções para o resumo financeiro
const translations = {
  pt: {
    totalIncome: 'Receita Total',
    totalExpenses: 'Despesas Totais',
    balance: 'Saldo'
  },
  en: {
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    balance: 'Balance'
  },
  es: {
    totalIncome: 'Ingresos Totales',
    totalExpenses: 'Gastos Totales',
    balance: 'Balance'
  },
  de: {
    totalIncome: 'Gesamteinkommen',
    totalExpenses: 'Gesamtausgaben',
    balance: 'Kontostand'
  }
};

interface FinancialSummaryProps {
  stats: TransactionStats;
}

export default function FinancialSummary({ stats }: FinancialSummaryProps) {
  const { totalIncome, totalExpense, balance } = stats;
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  
  // Selecionar a tradução correta com fallback para inglês
  const t = translations[userLocale as keyof typeof translations] || translations.en;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.totalIncome}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(totalIncome, userCurrency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.totalExpenses}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(totalExpense, userCurrency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.balance}</CardTitle>
          <ScaleIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(balance, userCurrency)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 