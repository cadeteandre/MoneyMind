"use client";

import { CategorySummary } from "@/app/actions/getTransactionStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { useDemo } from "@/hooks/useDemo";
import { useTranslation } from '@/app/i18n/client';

// Colors for the pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6B6B", "#54C8FF", "#2DD4BF"];

interface DemoExpensePieChartProps {
  data: CategorySummary[];
}

export default function DemoExpensePieChart({ data }: DemoExpensePieChartProps) {
  const { userLocale } = useLanguage();
  const { formatCurrency } = useDemo();
  const { t } = useTranslation(userLocale, 'charts');

  // If there's no data, show a message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pieChart.title')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('pieChart.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip formatter for the pie chart
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategorySummary;
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm">{data.category}</p>
          <p className="text-sm">{formatCurrency(data.total)}</p>
          <p className="text-xs text-muted-foreground">{data.count} {t('pieChart.transactions')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pieChart.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.map((entry, index) => (
            <div key={entry.category} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{entry.category}</span>
              <span className="text-muted-foreground ml-auto">
                {formatCurrency(entry.total)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 