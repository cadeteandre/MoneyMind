export type RecurrenceFrequency = 
  | "WEEKLY"
  | "BIWEEKLY" 
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "ANNUALLY"
  | "CUSTOM";

export type PaymentStatus = 
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "SKIPPED";

export interface IRecurringTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  categoryId?: string | null;
  description?: string | null;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number | null;        // Para mensal: dia do mês (1-31)
  dayOfWeek?: number | null;         // Para semanal: dia da semana (0-6)
  customDays?: number | null;        // Para frequência personalizada
  startDate: Date;
  endDate?: Date | null;             // Null = sem data final
  isActive: boolean;
  nextDueDate: Date;                 // Próxima data de vencimento
  lastProcessedDate?: Date | null;   // Última data processada
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecurringPayment {
  id: string;
  recurringTransactionId: string;
  transactionId?: string | null;     // Null se ainda não foi pago
  dueDate: Date;
  paidDate?: Date | null;
  status: PaymentStatus;
  amount: number;                    // Permite ajustar valor na hora do pagamento
  notes?: string | null;             // Notas específicas deste pagamento
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criação de nova transação fixa (sem campos auto-gerados)
export interface ICreateRecurringTransaction {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  categoryId?: string;
  description?: string;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  customDays?: number;
  startDate: Date;
  endDate?: Date;
}

// Interface para listagem com dados relacionados
export interface IRecurringTransactionWithPayments extends IRecurringTransaction {
  upcomingPayments?: IRecurringPayment[];
  lastPayment?: IRecurringPayment;
  totalPaid?: number;
  totalPending?: number;
} 