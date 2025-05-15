"use client";

import { MonthlyData } from "@/app/actions/getTransactionStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrency } from "@/components/providers/currency-provider";

// Translations for the monthly bar chart
const translations = {
  pt: {
    title: 'Receitas & Despesas Mensais',
    noData: 'Sem dados mensais disponíveis',
    income: 'Receita',
    expense: 'Despesa'
  },
  en: {
    title: 'Monthly Income & Expenses',
    noData: 'No monthly data available',
    income: 'Income',
    expense: 'Expense'
  },
  es: {
    title: 'Ingresos & Gastos Mensuales',
    noData: 'No hay datos mensuales disponibles',
    income: 'Ingreso',
    expense: 'Gasto'
  },
  de: {
    title: 'Monatliche Einnahmen & Ausgaben',
    noData: 'Keine monatlichen Daten verfügbar',
    income: 'Einkommen',
    expense: 'Ausgabe'
  }
};

interface MonthlyBarChartProps {
  data: MonthlyData[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const { userLocale } = useLanguage();
  const { userCurrency } = useCurrency();
  
  // Get translations based on user locale
  const t = translations[userLocale as keyof typeof translations] || translations.en;

  // If there's no data, show a message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">{t.noData}</p>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value, userCurrency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name={t.income} fill="#4ade80" />
            <Bar dataKey="expense" name={t.expense} fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 