"use client";

import { useEffect, useState } from "react";
import type { IRecurringTransaction } from "@/interfaces/IRecurringTransaction";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecurringTransactionForm } from "@/components/RecurringTransactionForm";
import { Calendar, Plus, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Play, Pause, Clock } from "lucide-react";

export default function RecurringTransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactions, setTransactions] = useState<IRecurringTransaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<IRecurringTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<IRecurringTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { userLocale } = useLanguage();
  const { userCurrency } = useCurrency();
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

  const getFrequencyLabel = (frequency: string, customDays?: number | null) => {
    switch (frequency) {
      case 'WEEKLY': return t('frequency.weekly');
      case 'BIWEEKLY': return t('frequency.biweekly');
      case 'MONTHLY': return t('frequency.monthly');
      case 'QUARTERLY': return t('frequency.quarterly');
      case 'SEMIANNUALLY': return t('frequency.semiannually');
      case 'ANNUALLY': return t('frequency.annually');
      case 'CUSTOM': return customDays ? `${t('frequency.custom')} (${customDays} ${t('customUnit.days')})` : t('frequency.custom');
      default: return frequency;
    }
  };

  const toggleActiveStatus = async (transaction: IRecurringTransaction) => {
    try {
      const response = await fetch(`/api/recurring-transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...transaction, isActive: !transaction.isActive }),
      });
      if (!response.ok) throw new Error('Failed to update');
      toast.success(transaction.isActive ? t('list.pausedSuccess') : t('list.activatedSuccess'));
      fetchData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error(t('list.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/recurring-transactions/${deletingTransaction.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success(t('list.deleteSuccess'));
      setIsDeleteConfirmOpen(false);
      setDeletingTransaction(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(t('list.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (transaction: IRecurringTransaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = (transaction: IRecurringTransaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteConfirmOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('page.title')}</h1>
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
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('page.newRecurring')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('form.createTitle')}</DialogTitle>
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
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('list.noRecurringTransactions')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('list.createFirst')}</p>
          <Button
            className="mt-4"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('page.newRecurring')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base">{transaction.category}</h3>
                    <Badge variant={transaction.isActive ? "default" : "secondary"}>
                      {transaction.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                    <Badge variant={transaction.type === "INCOME" ? "default" : "destructive"}>
                      {transaction.type === "INCOME" ? t('type.income') : t('type.expense')}
                    </Badge>
                  </div>
                  
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getFrequencyLabel(transaction.frequency, transaction.customDays)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{t('list.nextDue')}: {format(new Date(transaction.nextDueDate), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount, userCurrency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('list.since')}: {format(new Date(transaction.startDate), "dd/MM/yyyy")}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('list.edit')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => toggleActiveStatus(transaction)}>
                        {transaction.isActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            {t('list.pause')}
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            {t('list.activate')}
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => handleDeleteConfirm(transaction)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('list.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('form.editTitle')}</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <RecurringTransactionForm
              transaction={editingTransaction}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setEditingTransaction(null);
                fetchData();
              }}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('list.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('list.deleteConfirmMessage')}</p>
            {deletingTransaction && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{deletingTransaction.category}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(deletingTransaction.amount, userCurrency)} • {getFrequencyLabel(deletingTransaction.frequency, deletingTransaction.customDays)}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeletingTransaction(null);
                }}
                disabled={isDeleting}
              >
                {t('list.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t('list.deleting') : t('list.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 