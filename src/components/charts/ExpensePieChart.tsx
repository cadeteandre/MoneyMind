"use client";

import { CategorySummary } from "@/app/actions/getTransactionStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCurrency } from "@/lib/utils";
import React from "react";

// Function to normalize category names
const normalizeCategory = (category: string) => {
  return category.trim().toLowerCase();
};

// Colors for the pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6B6B", "#54C8FF", "#2DD4BF"];

interface ExpensePieChartProps {
  data: CategorySummary[];
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

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
    
    return Array.from(categoryMap.values());
  }, [data]);

  // If there's no data, show a message
  if (!normalizedData || normalizedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No expense data available</p>
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
          <p className="text-sm">{formatCurrency(data.total)}</p>
          <p className="text-xs text-muted-foreground">{data.count} transaction(s)</p>
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
        <CardTitle>Expenses by Category</CardTitle>
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