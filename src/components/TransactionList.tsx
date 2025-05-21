"use client"

import type { ITransaction } from "@/interfaces/ITransaction"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { MoreVertical, Edit, Trash2, Receipt, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
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
import { TransactionForm } from "./TransactionForm"
import { useCurrency } from "./providers/currency-provider"
import { useLanguage } from "./providers/language-provider"
import { useTranslation } from '@/app/i18n/client'

// Usar a interface do frontend
type Transaction = ITransaction;

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdated?: () => void
  isLoading?: boolean
}

export default function TransactionList({
  transactions,
  onTransactionUpdated,
  isLoading = false,
}: TransactionListProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'transactions');

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent || navigator.vendor : ""
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent))
    }

    checkMobile()

    // Also check on resize for responsive layouts
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    return () => {
      // Limpar todos os estados de modal quando o componente for desmontado
      setIsEditModalOpen(false)
      setIsDeleteAlertOpen(false)
      setOpenId(null)
      setEditTransaction(null)
      setDeleteTransaction(null)
      setIsDeleting(false)
    }
  }, [])

  const handleDelete = async () => {
    if (!deleteTransaction) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/transactions/${deleteTransaction.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      toast.success("Transaction deleted successfully")
      setIsDeleteAlertOpen(false)
      setDeleteTransaction(null)
      if (onTransactionUpdated) onTransactionUpdated()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
    } finally {
      setIsDeleting(false)
    }
  }

  const openReceipt = (transaction: Transaction) => {
    // Preferir a URL de download direta se disponível
    const imgUrl = transaction.receiptDownloadUrl || transaction.receiptUrl

    if (isMobile) {
      // Em dispositivos móveis, abrir diretamente no navegador
      window.open(imgUrl || "", "_blank")
    } else {
      // Em desktop, abrir no modal
      setOpenId(transaction.id)
      setImgUrl(imgUrl)
      setImgLoaded(false)
      setImgError(false)
    }
  }

  // Format date in a more readable way
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 w-full">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-muted-foreground mb-4">{t('noTransactions')}</p>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            setEditTransaction({
              id: "",
              userId: "",
              amount: 0,
              category: "",
              description: null,
              date: new Date(),
              type: "EXPENSE",
              receiptUrl: null,
              receiptDownloadUrl: null,
            })
            setIsEditModalOpen(true)
          }}
        >
          {t('addFirst')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          className={`p-4 flex flex-col sm:flex-row justify-between w-full relative hover:shadow-md transition-shadow duration-200 ${
            transaction.type === "INCOME" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-2 hidden sm:flex items-center justify-center ${
                transaction.type === "INCOME" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {transaction.type === "INCOME" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{transaction.category}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hidden sm:inline-block">
                  {t(`type.${transaction.type}`)}
                </span>
              </div>

              {transaction.description ? (
                <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
              ) : null}

              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(transaction.date)}</span>

                {transaction.receiptUrl && (
                  <>
                    {isMobile ? (
                      <button
                        onClick={() => openReceipt(transaction)}
                        className="cursor-pointer text-blue-600 hover:underline flex items-center gap-1 ml-2"
                        aria-label="View receipt"
                      >
                        <Receipt className="h-3 w-3" />
                        <span>{t('receipt')}</span>
                      </button>
                    ) : (
                      <Dialog
                        open={openId === transaction.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenId(transaction.id)
                            // Preferir a URL de download direta se disponível
                            setImgUrl(transaction.receiptDownloadUrl || transaction.receiptUrl)
                            setImgLoaded(false)
                            setImgError(false)
                          } else {
                            setOpenId(null)
                            setImgUrl(null)
                          }
                        }}
                      >
                        <button
                          onClick={() => openReceipt(transaction)}
                          className="cursor-pointer text-blue-600 hover:underline flex items-center gap-1 ml-2"
                          aria-label="View receipt"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>{t('receipt')}</span>
                        </button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Receipt</DialogTitle>
                          </DialogHeader>
                          {imgUrl && (
                            <div className="flex flex-col items-center gap-2">
                              <a
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 mb-2"
                              >
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                {t('openInBrowser')}
                              </a>

                              <div className="w-full max-w-md flex justify-center">
                                {!imgLoaded && !imgError && (
                                  <p className="text-center text-muted-foreground">{t('loadingReceipt')}</p>
                                )}
                                {imgError ? (
                                  <div className="text-center text-red-500">
                                    <p>{t('failedToLoad')}</p>
                                    <p className="text-xs mt-2">{t('useOpenInBrowser')}</p>
                                  </div>
                                ) : (
                                  <img
                                    src={imgUrl || "/placeholder.svg"}
                                    alt="Receipt"
                                    className="max-w-full max-h-[60vh] mx-auto rounded shadow object-contain"
                                    onLoad={() => setImgLoaded(true)}
                                    onError={() => {
                                      console.error("Image failed to load:", imgUrl)
                                      setImgError(true)
                                    }}
                                    style={{ display: imgLoaded ? "block" : "none" }}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 sm:mt-0">
            <div className="sm:text-right flex flex-col items-start sm:items-end gap-1">
              <p
                className={`font-semibold text-lg ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "INCOME" ? "+" : "-"} {formatCurrency(transaction.amount, userCurrency)}
              </p>
            </div>

            <div className="ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" aria-label="Transaction options">
                  <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
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
                    {t('edit')}
                  </DropdownMenuItem>

                  {transaction.receiptUrl && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          openReceipt(transaction)
                          // Close the dropdown menu when opening the modal
                          const closeEvent = new Event("keydown")
                          Object.defineProperty(closeEvent, "key", { value: "Escape" })
                          document.dispatchEvent(closeEvent)
                        }}
                        className="cursor-pointer"
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        {t('viewReceipt')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      setDeleteTransaction(transaction)
                      setIsDeleteAlertOpen(true)
                      // Close the dropdown menu when opening the modal
                      const closeEvent = new Event("keydown")
                      Object.defineProperty(closeEvent, "key", { value: "Escape" })
                      document.dispatchEvent(closeEvent)
                    }}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete')}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTransaction && editTransaction.id ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm
              transaction={{
                ...editTransaction,
                // Garantir que date seja sempre um Date
                date: editTransaction.date instanceof Date ? editTransaction.date : new Date(editTransaction.date)
              }}
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
            <DialogTitle>{t('deleteConfirmation.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground">
              {t('deleteConfirmation.description')}
              {deleteTransaction?.receiptUrl && t('deleteConfirmation.withReceipt')}.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" className="cursor-pointer" onClick={() => setIsDeleteAlertOpen(false)}>
              {t('deleteConfirmation.cancel')}
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              {isDeleting ? t('deleteConfirmation.deleting') : t('deleteConfirmation.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}