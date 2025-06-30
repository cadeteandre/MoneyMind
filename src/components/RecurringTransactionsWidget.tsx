"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "./providers/currency-provider";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { useCategoryTranslation } from '@/hooks/useCategoryTranslation';
import { useCategories } from '@/hooks/useCategories';
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

type UpcomingPayment = {
  id: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'OVERDUE';
  recurringTransaction: {
    frequency: string;
    category: string;
    type: "INCOME" | "EXPENSE";
  };
};

export const RecurringTransactionsWidget = React.memo(() => {
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'dashboard');

  // Hooks para tradução de categorias
  const { categories } = useCategories({ type: 'ALL' });
  const { translateCategoryName } = useCategoryTranslation();

  // Função para traduzir nome da categoria memoizada
  const getTranslatedCategoryName = React.useMemo(() => {
    return (categoryName: string) => {
      // Verificar se a categoria existe no banco (é padrão)
      const categoryObj = categories.find(cat => cat.name === categoryName);
      if (categoryObj && categoryObj.isDefault) {
        return translateCategoryName(categoryName, true);
      }
      // Se não for categoria padrão, manter nome original
      return categoryName;
    };
  }, [categories, translateCategoryName]);

  const fetchUpcomingPayments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recurring-payments?status=PENDING,OVERDUE&limit=5');
      if (response.ok) {
        const data = await response.json();
        const payments = data.payments || [];
        setUpcomingPayments(Array.isArray(payments) ? payments : []);
      } else {
        console.error("Error fetching upcoming payments:", response.statusText);
        setUpcomingPayments([]);
      }
    } catch (error) {
      console.error("Error fetching upcoming payments:", error);
      setUpcomingPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingPayments();
  }, [fetchUpcomingPayments]);

  const getStatusBadge = (payment: UpcomingPayment) => {
    if (payment.status === 'OVERDUE') {
      return <Badge variant="destructive" className="text-xs">{t('recurringWidget.overdue')}</Badge>;
    }
    return <Badge variant="default" className="text-xs">{t('recurringWidget.pending')}</Badge>;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY':
        return t('frequency.weekly');
      case 'MONTHLY':
        return t('frequency.monthly');
      case 'QUARTERLY':
        return t('frequency.quarterly');
      case 'YEARLY':
        return t('frequency.yearly');
      default:
        return frequency;
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{t('recurringWidget.title')}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchUpcomingPayments}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium"
              asChild
            >
              <Link href="/dashboard/pending-payments">
                {t('recurringWidget.viewAll')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : upcomingPayments.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{t('recurringWidget.noUpcoming')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      {getTranslatedCategoryName(payment.recurringTransaction.category)}
                    </h4>
                    {getStatusBadge(payment)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getFrequencyLabel(payment.recurringTransaction.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(payment.dueDate), "dd/MM")}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    payment.recurringTransaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {payment.recurringTransaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(payment.amount, userCurrency)}
                  </p>
                </div>
              </div>
            ))}
            
            {upcomingPayments.length > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link href="/dashboard/pending-payments">
                    {t('recurringWidget.managePayments')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecurringTransactionsWidget.displayName = 'RecurringTransactionsWidget'; 