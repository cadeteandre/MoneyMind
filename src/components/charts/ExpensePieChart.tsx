"use client";

import { CategorySummary } from "@/app/actions/getTransactionStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Colors for the pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6B6B", "#54C8FF", "#2DD4BF"];

interface ExpensePieChartProps {
  data: CategorySummary[];
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  // If there's no data, show a message
  if (!data || data.length === 0) {
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
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">R$ {data.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{data.count} transaction(s)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="total"
              nameKey="category"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 