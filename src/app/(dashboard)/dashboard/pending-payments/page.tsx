"use client";

import { useEffect, useState } from "react";
import type { IRecurringPayment } from "@/interfaces/IRecurringTransaction";
import { Button } from "@/components/ui/button";
import { RecurringPaymentCard } from "@/components/RecurringPaymentCard";
import { Calendar, RotateCcw, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PaymentWithTransaction = IRecurringPayment & {
  recurringTransaction: {
    category: string;
    type: "INCOME" | "EXPENSE";
    description?: string | null;
  };
};

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());

  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recurring-payments?status=PENDING,OVERDUE');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const payments = data.payments || [];
      setPayments(Array.isArray(payments) ? payments : []);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      toast.error(t('payments.fetchError'));
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (payment: IRecurringPayment) => {
    try {
      setProcessingPayments(prev => new Set(prev).add(payment.id));
      
      const response = await fetch(`/api/recurring-transactions/${payment.recurringTransactionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          amount: payment.amount,
          paidDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      toast.success(t('payments.paymentSuccess'));
      fetchData();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error instanceof Error ? error.message : t('payments.paymentError'));
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  const handleSkipPayment = async (payment: IRecurringPayment) => {
    try {
      setProcessingPayments(prev => new Set(prev).add(payment.id));
      
      const response = await fetch(`/api/recurring-transactions/${payment.recurringTransactionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          status: 'SKIPPED',
          notes: t('payments.skippedByUser'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to skip payment');
      }

      toast.success(t('payments.skipSuccess'));
      fetchData();
    } catch (error) {
      console.error("Error skipping payment:", error);
      toast.error(error instanceof Error ? error.message : t('payments.skipError'));
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  const processAllPendingPayments = async () => {
    try {
      const response = await fetch('/api/recurring-transactions/process', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payments');
      }

      const result = await response.json();
      toast.success(`${t('payments.processAllSuccess')} ${result.processed}`);
      fetchData();
    } catch (error) {
      console.error("Error processing all payments:", error);
      toast.error(error instanceof Error ? error.message : t('payments.processAllError'));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingPayments = Array.isArray(payments) ? payments.filter(p => p.status === 'PENDING') : [];
  const overduePayments = Array.isArray(payments) ? payments.filter(p => p.status === 'OVERDUE') : [];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('payments.pageTitle')}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('page.refresh')}
          </Button>
          
          <Button 
            size="sm" 
            onClick={processAllPendingPayments}
            disabled={isLoading || !Array.isArray(payments) || payments.length === 0}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {t('payments.processAll')}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="default">{t('paymentStatus.pending')}</Badge>
            <span className="text-2xl font-bold">{pendingPayments.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{t('paymentStatus.overdue')}</Badge>
            <span className="text-2xl font-bold">{overduePayments.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('payments.total')}</Badge>
            <span className="text-2xl font-bold">{Array.isArray(payments) ? payments.length : 0}</span>
          </div>
        </Card>
      </div>

      {/* Tabs para categorizar pagamentos */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{t('payments.all')} ({Array.isArray(payments) ? payments.length : 0})</TabsTrigger>
          <TabsTrigger value="overdue">{t('paymentStatus.overdue')} ({overduePayments.length})</TabsTrigger>
          <TabsTrigger value="pending">{t('paymentStatus.pending')} ({pendingPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !Array.isArray(payments) || payments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('payments.noPayments')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('payments.allCaughtUp')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <RecurringPaymentCard
                  key={payment.id}
                  payment={payment}
                  onPay={handlePayment}
                  onSkip={handleSkipPayment}
                  isProcessing={processingPayments.has(payment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4 mt-6">
          {overduePayments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('payments.noOverdue')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('payments.greatJob')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overduePayments.map((payment) => (
                <RecurringPaymentCard
                  key={payment.id}
                  payment={payment}
                  onPay={handlePayment}
                  onSkip={handleSkipPayment}
                  isProcessing={processingPayments.has(payment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('payments.noPending')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('payments.nothingDue')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <RecurringPaymentCard
                  key={payment.id}
                  payment={payment}
                  onPay={handlePayment}
                  onSkip={handleSkipPayment}
                  isProcessing={processingPayments.has(payment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 