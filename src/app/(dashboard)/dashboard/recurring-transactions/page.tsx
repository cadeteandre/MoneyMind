"use client";

import { useEffect, useState } from "react";
import type { IRecurringTransaction } from "@/interfaces/IRecurringTransaction";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecurringTransactionForm } from "@/components/RecurringTransactionForm";
import RecurringTransactionList from "@/components/RecurringTransactionList";
import { Calendar, Plus, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { toast } from "sonner";

export default function RecurringTransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<IRecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recurring-transactions');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
      toast.error(t('list.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-between lg:items-center">
        <h1 className="text-xl sm:text-2xl font-bold">{t('page.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('page.refresh')}
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('page.newRecurring')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 w-[calc(100vw-2rem)] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{t('form.createTitle')}</DialogTitle>
              </DialogHeader>
              <RecurringTransactionForm
                onSuccess={() => {
                  fetchData();
                  setIsCreateModalOpen(false);
                }}
                onClose={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de transações */}
      {!isLoading && transactions.length === 0 ? (
        <div className="text-center py-8 px-4">
          <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          <h3 className="mt-4 text-base sm:text-lg font-semibold">{t('list.noRecurringTransactions')}</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">{t('list.createFirst')}</p>
          <Button
            className="mt-4 w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('page.newRecurring')}
          </Button>
        </div>
      ) : (
        <RecurringTransactionList
          transactions={transactions}
          onTransactionUpdated={fetchData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
} 