"use client"

import { useEffect, useState } from "react"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import TransactionList from "@/components/TransactionList"
import type { Transaction as PrismaTransaction } from "@prisma/client"
import { getTransactions } from "@/app/actions/getTransactions"
import { type TransactionStats, getTransactionStats } from "@/app/actions/getTransactionStats"
import ExpensePieChart from "@/components/charts/ExpensePieChart"
import MonthlyBarChart from "@/components/charts/MonthlyBarChart"
import FinancialSummary from "@/components/FinancialSummary"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/TransactionForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, ChevronRight, RefreshCw, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Definir o tipo de Transaction compatível com TransactionList
interface TransactionWithDownload extends PrismaTransaction {
  receiptDownloadUrl: string | null
}

export default function DashboardClient() {
  // Estado para cada modal
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false)
  const [isOverviewEmptyModalOpen, setIsOverviewEmptyModalOpen] = useState(false)
  const [isTransactionsHeaderModalOpen, setIsTransactionsHeaderModalOpen] = useState(false)
  const [isTransactionsEmptyModalOpen, setIsTransactionsEmptyModalOpen] = useState(false)
  
  const [transactions, setTransactions] = useState<TransactionWithDownload[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    byCategory: [],
    byMonth: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchData = async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true)
    setError(null)

    try {
      // Prepare date parameters
      const params: { startDate?: string; endDate?: string } = {}
      if (startDate) params.startDate = startDate.toISOString()
      if (endDate) params.endDate = endDate.toISOString()

      // Fetch transactions and stats
      const [rawTransactions, statsData] = await Promise.all([getTransactions(params), getTransactionStats(params)])

      // Adicionar o campo receiptDownloadUrl a cada transação
      const processedTransactions = rawTransactions.map((transaction) => ({
        ...transaction,
        receiptDownloadUrl: transaction.receiptUrl, // Usar a mesma URL como fallback
      }))

      setTransactions(processedTransactions)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Não foi possível carregar os dados. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header com título e ações */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your finances in one place</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading} className="h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Updating..." : "Update"}
          </Button>

          <Dialog 
            open={isHeaderModalOpen} 
            modal={true}
            onOpenChange={(open) => {
              // Se estiver tentando abrir, permitir
              if (open) {
                setIsHeaderModalOpen(true);
                return;
              }
              // Se estiver tentando fechar, impedir
              return;
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-md"
              onPointerDownOutside={e => e.preventDefault()}
              onInteractOutside={e => e.preventDefault()}
              onEscapeKeyDown={e => e.preventDefault()}
            >
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full" 
                    onClick={() => setIsHeaderModalOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              </DialogHeader>
              <TransactionForm
                onSuccess={() => {
                  fetchData()
                  setIsHeaderModalOpen(false)
                }}
                onClose={() => setIsHeaderModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros de data */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Select a period to analyze your data</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <DateRangeFilter onFilter={fetchData} />
        </CardContent>
      </Card>

      {/* Tabs para alternar entre visões */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
          {/* Resumo financeiro */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <FinancialSummary stats={stats} />
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Card className="border shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <div className="flex flex-col space-y-2 mt-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-end w-full gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className={`h-${10 + i * 3} w-full`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                    <CardDescription>Distribution of your expenses by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.byCategory.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No expense data available for this period
                      </div>
                    ) : (
                      <ExpensePieChart data={stats.byCategory} />
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>Revenue and expenses over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.byMonth.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No monthly data available for this period
                      </div>
                    ) : (
                      <MonthlyBarChart data={stats.byMonth} />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Transações recentes na visão geral */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Transactions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium"
                  onClick={() => setActiveTab("transactions")}
                >
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first transaction to start tracking your finances.
                  </p>
                  <Dialog 
                    open={isOverviewEmptyModalOpen} 
                    modal={true}
                    onOpenChange={(open) => {
                      // Se estiver tentando abrir, permitir
                      if (open) {
                        setIsOverviewEmptyModalOpen(true);
                        return;
                      }
                      // Se estiver tentando fechar, impedir
                      return;
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent 
                      className="sm:max-w-md"
                      onPointerDownOutside={e => e.preventDefault()}
                      onInteractOutside={e => e.preventDefault()}
                      onEscapeKeyDown={e => e.preventDefault()}
                    >
                      <DialogHeader>
                        <div className="flex justify-between items-center">
                          <DialogTitle>Add New Transaction</DialogTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full" 
                            onClick={() => setIsOverviewEmptyModalOpen(false)}
                          >
                            ×
                          </Button>
                        </div>
                      </DialogHeader>
                      <TransactionForm
                        onSuccess={() => {
                          fetchData()
                          setIsOverviewEmptyModalOpen(false)
                        }}
                        onClose={() => setIsOverviewEmptyModalOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <TransactionList
                  transactions={transactions.slice(0, 3)}
                  onTransactionUpdated={() => fetchData()}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 animate-in fade-in-50">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Transactions</CardTitle>
                <Dialog 
                  open={isTransactionsHeaderModalOpen} 
                  modal={true}
                  onOpenChange={(open) => {
                    // Se estiver tentando abrir, permitir
                    if (open) {
                      setIsTransactionsHeaderModalOpen(true);
                      return;
                    }
                    // Se estiver tentando fechar, impedir
                    return;
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="sm:max-w-md"
                    onPointerDownOutside={e => e.preventDefault()}
                    onInteractOutside={e => e.preventDefault()}
                    onEscapeKeyDown={e => e.preventDefault()}
                  >
                    <DialogHeader>
                      <div className="flex justify-between items-center">
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full" 
                          onClick={() => setIsTransactionsHeaderModalOpen(false)}
                        >
                          ×
                        </Button>
                      </div>
                    </DialogHeader>
                    <TransactionForm
                      onSuccess={() => {
                        fetchData()
                        setIsTransactionsHeaderModalOpen(false)
                      }}
                      onClose={() => setIsTransactionsHeaderModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                {transactions.length > 0
                  ? `Showing ${transactions.length} transactions`
                  : "No transactions found"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first transaction to start tracking your finances.
                  </p>
                  <Dialog 
                    open={isTransactionsEmptyModalOpen} 
                    modal={true}
                    onOpenChange={(open) => {
                      // Se estiver tentando abrir, permitir
                      if (open) {
                        setIsTransactionsEmptyModalOpen(true);
                        return;
                      }
                      // Se estiver tentando fechar, impedir
                      return;
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent 
                      className="sm:max-w-md"
                      onPointerDownOutside={e => e.preventDefault()}
                      onInteractOutside={e => e.preventDefault()}
                      onEscapeKeyDown={e => e.preventDefault()}
                    >
                      <DialogHeader>
                        <div className="flex justify-between items-center">
                          <DialogTitle>Add New Transaction</DialogTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full" 
                            onClick={() => setIsTransactionsEmptyModalOpen(false)}
                          >
                            ×
                          </Button>
                        </div>
                      </DialogHeader>
                      <TransactionForm
                        onSuccess={() => {
                          fetchData()
                          setIsTransactionsEmptyModalOpen(false)
                        }}
                        onClose={() => setIsTransactionsEmptyModalOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-4">
                  <TransactionList
                    transactions={transactions}
                    onTransactionUpdated={() => fetchData()}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}