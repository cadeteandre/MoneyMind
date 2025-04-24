"use client";

import { MonthlyData } from "@/app/actions/getTransactionStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyBarChartProps {
  data: MonthlyData[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  // If there's no data, show a message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No monthly data available</p>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: R$ {item.value.toFixed(2)}
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
        <CardTitle>Monthly Income & Expenses</CardTitle>
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
            <Bar dataKey="income" name="Income" fill="#4ade80" />
            <Bar dataKey="expense" name="Expense" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 