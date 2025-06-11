"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Filter, Plus, Search } from "lucide-react";
import { useMockData } from "@/components/demo/MockDataProviderI18n";
import { useDemo } from "@/hooks/useDemo";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";
import DemoTransactionList from "@/components/demo/DemoTransactionList";

export default function DemoTransactionsPage() {
  const mockData = useMockData();
  const { } = useDemo();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'dashboard');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "income" | "expense">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Filter transactions
  const filteredTransactions = mockData.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === "ALL" || transaction.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = [...new Set(mockData.transactions.map(t => t.category))];

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {t('transactions')} - Demo
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredTransactions.length} {t('transactionsFound')}
          </p>
        </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              {t('newTransaction')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchTransactions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={(value: "ALL" | "income" | "expense") => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                  <SelectItem value="income">{t('income')}</SelectItem>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("ALL");
                  setCategoryFilter("ALL");
                }}
              >
                {t('clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('transactionsList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DemoTransactionList transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>
    );
} 