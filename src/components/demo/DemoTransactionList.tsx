"use client"

import { Card } from "@/components/ui/card"
import { Receipt, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useDemo } from "@/hooks/useDemo"

interface DemoTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

interface DemoTransactionListProps {
  transactions: DemoTransaction[]
  isLoading?: boolean
}

export default function DemoTransactionList({
  transactions,
  isLoading = false,
}: DemoTransactionListProps) {
  const { formatCurrency, formatDate, simulateAction } = useDemo()

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
        <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => simulateAction("add transaction")}
        >
          Adicionar primeira transação
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`
                p-2 rounded-full flex-shrink-0
                ${transaction.type === 'income' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }
              `}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">
                    {transaction.description}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{transaction.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={`
                font-semibold text-sm
                ${transaction.type === 'income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
                }
              `}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  onClick={() => simulateAction("view receipt")}
                >
                  <Receipt className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 