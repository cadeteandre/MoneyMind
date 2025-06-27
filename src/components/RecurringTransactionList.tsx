"use client"

import type { IRecurringTransaction } from "@/interfaces/IRecurringTransaction"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { MoreVertical, Edit, Trash2, Play, Pause, Clock, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RecurringTransactionForm } from "./RecurringTransactionForm"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "./providers/currency-provider"
import { useLanguage } from "./providers/language-provider"
import { useTranslation } from '@/app/i18n/client'
import { format } from "date-fns"

interface RecurringTransactionListProps {
  transactions: IRecurringTransaction[]
  onTransactionUpdated?: () => void
  isLoading?: boolean
}

export default function RecurringTransactionList({
  transactions,
  onTransactionUpdated,
  isLoading = false,
}: RecurringTransactionListProps) {
  const [editTransaction, setEditTransaction] = useState<IRecurringTransaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteTransaction, setDeleteTransaction] = useState<IRecurringTransaction | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');

  useEffect(() => {
    return () => {
      // Limpar todos os estados de modal quando o componente for desmontado
      setIsEditModalOpen(false)
      setIsDeleteAlertOpen(false)
      setEditTransaction(null)
      setDeleteTransaction(null)
      setIsDeleting(false)
    }
  }, [])

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
      if (onTransactionUpdated) onTransactionUpdated();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error(t('list.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTransaction) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/recurring-transactions/${deleteTransaction.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      toast.success(t('list.deleteSuccess'))
      setIsDeleteAlertOpen(false)
      setDeleteTransaction(null)
      if (onTransactionUpdated) onTransactionUpdated()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error(t('list.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
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
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t('list.noRecurringTransactions')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('list.createFirst')}</p>
      </div>
    )
  }

  return (
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
                  <DropdownMenuItem
                    onClick={() => {
                      setEditTransaction(transaction)
                      setIsEditModalOpen(true)
                      // Fechar o dropdown menu quando abrir o modal
                      const closeEvent = new Event("keydown")
                      Object.defineProperty(closeEvent, "key", { value: "Escape" })
                      document.dispatchEvent(closeEvent)
                    }}
                    className="cursor-pointer"
                  >
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
                    onClick={() => {
                      setDeleteTransaction(transaction)
                      setIsDeleteAlertOpen(true)
                      // Fechar o dropdown menu quando abrir o modal
                      const closeEvent = new Event("keydown")
                      Object.defineProperty(closeEvent, "key", { value: "Escape" })
                      document.dispatchEvent(closeEvent)
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
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

      {/* Edit Transaction Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            // Clean up state immediately when modal closes
            setEditTransaction(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('form.editTitle')}</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <RecurringTransactionForm
              transaction={editTransaction}
              onSuccess={() => {
                setIsEditModalOpen(false)
                if (onTransactionUpdated) onTransactionUpdated()
              }}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          setIsDeleteAlertOpen(open)
          if (!open) {
            // Clean up state immediately when dialog closes
            setDeleteTransaction(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('list.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground">
              {t('list.deleteConfirmMessage')}
            </p>
            {deleteTransaction && (
              <div className="p-3 bg-muted rounded-lg mt-3">
                <p className="font-medium">{deleteTransaction.category}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(deleteTransaction.amount, userCurrency)} • {getFrequencyLabel(deleteTransaction.frequency, deleteTransaction.customDays)}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" className="cursor-pointer" onClick={() => setIsDeleteAlertOpen(false)}>
              {t('list.cancel')}
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              {isDeleting ? t('list.deleting') : t('list.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 