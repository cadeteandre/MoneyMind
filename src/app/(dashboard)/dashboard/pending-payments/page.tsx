"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { IRecurringPayment } from "@/interfaces/IRecurringTransaction";
import { Button } from "@/components/ui/button";
import { RecurringPaymentCard } from "@/components/RecurringPaymentCard";
import { Calendar, RotateCcw, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { useCategories } from '@/hooks/useCategories';
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
  
  // Carregar categorias uma única vez para toda a página
  const { categories, loading: categoriesLoading } = useCategories({ type: 'ALL' });

  // Estado de carregamento combinado - aguarda tanto dados quanto traduções
  const isLoadingComplete = isLoading || categoriesLoading;

  // Memoizar filtros para evitar recálculos desnecessários
  const { pendingPayments, overduePayments, totalPayments } = useMemo(() => {
    if (!Array.isArray(payments)) {
      return { pendingPayments: [], overduePayments: [], totalPayments: 0 };
    }
    
    const pending = payments.filter(p => p.status === 'PENDING');
    const overdue = payments.filter(p => p.status === 'OVERDUE');
    
    return {
      pendingPayments: pending,
      overduePayments: overdue,
      totalPayments: payments.length
    };
  }, [payments]);

  const fetchData = useCallback(async () => {
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
  }, [t]);

  const handlePayment = useCallback(async (payment: IRecurringPayment) => {
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
  }, [t, fetchData]);

  const handleSkipPayment = useCallback(async (payment: IRecurringPayment) => {
    try {
      setProcessingPayments(prev => new Set(prev).add(payment.id));
      
      // Usar endpoint específico para pular pagamento sem criar transação
      const response = await fetch(`/api/recurring-transactions/${payment.recurringTransactionId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
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
  }, [t, fetchData]);

  const processAllPendingPayments = useCallback(async () => {
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
  }, [t, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoizar componentes de estatísticas
  const StatsCards = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">{t('paymentStatus.pending')}</Badge>
          </div>
          <span className="text-xl sm:text-2xl font-bold">{pendingPayments.length}</span>
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">{t('paymentStatus.overdue')}</Badge>
          </div>
          <span className="text-xl sm:text-2xl font-bold">{overduePayments.length}</span>
        </div>
      </Card>
      <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{t('payments.total')}</Badge>
          </div>
          <span className="text-xl sm:text-2xl font-bold">{totalPayments}</span>
        </div>
      </Card>
    </div>
  ), [pendingPayments.length, overduePayments.length, totalPayments, t]);

  // Componente de lista de pagamentos memoizado
  const PaymentsList = useMemo(() => {
    const PaymentsListComponent = ({ paymentsToShow }: { paymentsToShow: PaymentWithTransaction[] }) => (
      <div className="space-y-3 sm:space-y-4">
        {paymentsToShow.map((payment) => (
          <RecurringPaymentCard
            key={payment.id}
            payment={payment}
            onPay={handlePayment}
            onSkip={handleSkipPayment}
            isProcessing={processingPayments.has(payment.id)}
            categories={categories} // Passar categorias como prop para evitar múltiplas chamadas
          />
        ))}
      </div>
    );
    PaymentsListComponent.displayName = 'PaymentsListComponent';
    return PaymentsListComponent;
  }, [handlePayment, handleSkipPayment, processingPayments, categories]);

  // Skeleton component memoizado
  const LoadingSkeleton = useMemo(() => {
    const LoadingSkeletonComponent = () => (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
    LoadingSkeletonComponent.displayName = 'LoadingSkeletonComponent';
    return LoadingSkeletonComponent;
  }, []);

  // Empty state component memoizado
  const EmptyState = useMemo(() => {
    const EmptyStateComponent = ({ title, description }: { title: string; description: string }) => (
      <div className="text-center py-8 px-4">
        <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        <h3 className="mt-4 text-base sm:text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
    );
    EmptyStateComponent.displayName = 'EmptyStateComponent';
    return EmptyStateComponent;
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-between lg:items-center">
        <h1 className="text-xl sm:text-2xl font-bold">{t('payments.pageTitle')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoadingComplete}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('page.refresh')}
          </Button>
          
          <Button 
            size="sm" 
            onClick={processAllPendingPayments}
            disabled={isLoadingComplete || totalPayments === 0}
            className="w-full sm:w-auto"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('payments.processAll')}</span>
            <span className="sm:hidden">{t('payments.processAllShort')}</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {StatsCards}

      {/* Tabs para categorizar pagamentos */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="all" className="cursor-pointer text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">{t('payments.all')} ({totalPayments})</span>
            <span className="sm:hidden">{t('payments.allShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="cursor-pointer text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">{t('paymentStatus.overdue')} ({overduePayments.length})</span>
            <span className="sm:hidden">{t('payments.overdueShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="cursor-pointer text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">{t('paymentStatus.pending')} ({pendingPayments.length})</span>
            <span className="sm:hidden">{t('payments.pendingShort')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {isLoadingComplete ? (
            <LoadingSkeleton />
          ) : totalPayments === 0 ? (
            <EmptyState 
              title={t('payments.noPayments')} 
              description={t('payments.allCaughtUp')} 
            />
          ) : (
            <PaymentsList paymentsToShow={payments} />
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {overduePayments.length === 0 ? (
            <EmptyState 
              title={t('payments.noOverdue')} 
              description={t('payments.greatJob')} 
            />
          ) : (
            <PaymentsList paymentsToShow={overduePayments} />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {pendingPayments.length === 0 ? (
            <EmptyState 
              title={t('payments.noPending')} 
              description={t('payments.nothingDue')} 
            />
          ) : (
            <PaymentsList paymentsToShow={pendingPayments} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 