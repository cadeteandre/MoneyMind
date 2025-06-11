"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Eye } from "lucide-react";
import { useMockData } from "@/components/demo/MockDataProviderI18n";
import { useDemo } from "@/hooks/useDemo";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";
import { CategorySummary, MonthlyData } from "@/app/actions/getTransactionStats";
import DemoExpensePieChart from "@/components/demo/DemoExpensePieChart";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";

export default function DemoDashboardPage() {
  const mockData = useMockData();
  const { formatCurrency } = useDemo();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'dashboard');
  const [activeTab, setActiveTab] = useState("overview");

  const recentTransactions = mockData.transactions.slice(0, 5);

  // Transform chart data to match expected types
  const categoryChartData: CategorySummary[] = mockData.getCategoryChartData().map(item => ({
    category: item.category,
    total: item.amount,
    count: Math.floor(Math.random() * 10) + 1
  }));

  const monthlyChartData: MonthlyData[] = mockData.getMonthlyChartData().map(item => ({
    month: item.month,
    income: item.income,
    expense: item.expenses // Note: 'expense' not 'expenses'
  }));

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {t('title')} - Demo
          </h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('demoMode')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full sm:w-[400px] gap-2">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('transactions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Financial Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                                 <CardContent>
                   <div className="text-2xl font-bold text-green-600">
                     {formatCurrency(mockData.metrics.monthlyIncome)}
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
                   <TrendingDown className="h-4 w-4 text-red-600" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold text-red-600">
                     {formatCurrency(mockData.metrics.monthlyExpenses)}
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">{t('balance')}</CardTitle>
                   <DollarSign className="h-4 w-4 text-primary" />
                 </CardHeader>
                 <CardContent>
                   <div className={`text-2xl font-bold ${mockData.metrics.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {formatCurrency(mockData.metrics.totalBalance)}
                   </div>
                </CardContent>
              </Card>
            </div>

                         {/* Charts */}
             <div className="grid gap-4 md:grid-cols-2">
               <Card>
                 <CardHeader>
                   <CardTitle>{t('expensesByCategory')}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <DemoExpensePieChart data={categoryChartData} />
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle>{t('monthlyTrends')}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <MonthlyBarChart data={monthlyChartData} />
                 </CardContent>
               </Card>
             </div>

             {/* Recent Transactions */}
             <Card>
               <CardHeader>
                 <CardTitle>{t('recentTransactions')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   {recentTransactions.map((transaction) => (
                     <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                       <div>
                         <p className="font-medium">{transaction.description}</p>
                         <p className="text-sm text-muted-foreground">{transaction.category}</p>
                       </div>
                       <div className="text-right">
                         <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {formatCurrency(transaction.amount)}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {new Date(transaction.date).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="transactions" className="space-y-6 mt-6">
             <Card>
               <CardHeader>
                 <CardTitle>{t('allTransactions')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="max-h-[600px] overflow-y-auto space-y-2">
                   {mockData.transactions.map((transaction) => (
                     <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                       <div>
                         <p className="font-medium">{transaction.description}</p>
                         <p className="text-sm text-muted-foreground">{transaction.category}</p>
                       </div>
                       <div className="text-right">
                         <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {formatCurrency(transaction.amount)}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {new Date(transaction.date).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
} 