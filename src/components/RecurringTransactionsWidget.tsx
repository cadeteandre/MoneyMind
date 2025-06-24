"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "./providers/currency-provider";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

interface UpcomingPayment {
  id: string;
  dueDate: Date;
  amount: number;
  status: string;
  recurringTransaction: {
    category: string;
    type: "INCOME" | "EXPENSE";
    frequency: string;
  };
}

export const RecurringTransactionsWidget: React.FC = () => {
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'dashboard');

  const fetchUpcomingPayments = async () => {
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
  };

  useEffect(() => {
    fetchUpcomingPayments();
  }, []);

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY': return t('recurringWidget.weekly');
      case 'BIWEEKLY': return t('recurringWidget.biweekly');
      case 'MONTHLY': return t('recurringWidget.monthly');
      case 'QUARTERLY': return t('recurringWidget.quarterly');
      case 'SEMIANNUALLY': return t('recurringWidget.semiannually');
      case 'ANNUALLY': return t('recurringWidget.annually');
      default: return frequency;
    }
  };

  const getStatusBadge = (payment: UpcomingPayment) => {
    const isOverdue = new Date(payment.dueDate) < new Date();
    if (isOverdue) {
      return <Badge variant="destructive">{t('recurringWidget.overdue')}</Badge>;
    }
    return <Badge variant="default">{t('recurringWidget.pending')}</Badge>;
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
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingPayments.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('recurringWidget.noUpcoming')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              asChild
            >
              <Link href="/dashboard/recurring-transactions">
                {t('recurringWidget.createFirst')}
              </Link>
            </Button>
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
                      {payment.recurringTransaction.category}
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
}; 