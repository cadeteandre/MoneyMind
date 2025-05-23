"use client";

import { CategorySummary } from "@/app/actions/getTransactionStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTranslation } from '@/app/i18n/client';

// Function to normalize category names
const normalizeCategory = (category: string) => {
  return category.trim().toLowerCase();
};

// Colors for the pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6B6B", "#54C8FF", "#2DD4BF"];

// Limite percentual para agrupamento de categorias pequenas
const GROUPING_THRESHOLD = 0.05; // 5%

interface ExpensePieChartProps {
  data: CategorySummary[];
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { userLocale } = useLanguage();
  const { userCurrency } = useCurrency();
  const { t } = useTranslation(userLocale, 'charts');

  // Normalize and aggregate data by category
  const normalizedData = React.useMemo(() => {
    const categoryMap = new Map<string, CategorySummary>();
    data.forEach(item => {
      const normalizedCategory = normalizeCategory(item.category);
      const existing = categoryMap.get(normalizedCategory);
      if (existing) {
        existing.total += item.total;
        existing.count += item.count;
      } else {
        categoryMap.set(normalizedCategory, {
          ...item,
          category: item.category.trim() // Keep original case for display
        });
      }
    });
    const aggregated = Array.from(categoryMap.values());

    // --- Agrupamento de categorias pequenas em "Outros" ---
    const totalSum = aggregated.reduce((sum, item) => sum + item.total, 0);
    const mainCategories: CategorySummary[] = [];
    const otherCategories: CategorySummary[] = [];

    aggregated.forEach(item => {
      if (item.total / totalSum < GROUPING_THRESHOLD) {
        otherCategories.push(item);
      } else {
        mainCategories.push(item);
      }
    });

    if (otherCategories.length > 0) {
      const otherTotal = otherCategories.reduce((sum, item) => sum + item.total, 0);
      const otherCount = otherCategories.reduce((sum, item) => sum + item.count, 0);
      mainCategories.push({
        category: t ? t('pieChart.others') : 'Outros',
        total: otherTotal,
        count: otherCount,
        // Adicione um campo opcional para detalhamento futuro
        groupedCategories: otherCategories
      } as CategorySummary & { groupedCategories?: CategorySummary[] });
    }

    return mainCategories;
  }, [data, t]);

  // If there's no data, show a message
  if (!normalizedData || normalizedData.length === 0) {
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
        <div className="bg-background p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">{formatCurrency(data.total, userCurrency)}</p>
          <p className="text-xs text-muted-foreground">{data.count} {t('pieChart.transactions')}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate chart dimensions based on screen size
  const getChartDimensions = () => {
    if (isMobile) {
      return {
        height: 300,
        outerRadius: 80,
        legendPosition: "bottom" as const
      };
    }
    if (isTablet) {
      return {
        height: 350,
        outerRadius: 90,
        legendPosition: "bottom" as const
      };
    }
    return {
      height: 300,
      outerRadius: 100,
      legendPosition: "right" as const
    };
  };

  const { height, outerRadius, legendPosition } = getChartDimensions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pieChart.title')}</CardTitle>
      </CardHeader>
      <CardContent style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="total"
              nameKey="category"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {normalizedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
              verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
              align={legendPosition === "bottom" ? "center" : "right"}
              wrapperStyle={{
                paddingTop: legendPosition === "bottom" ? "20px" : "0"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 