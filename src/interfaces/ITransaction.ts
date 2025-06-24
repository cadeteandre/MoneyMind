export interface ITransaction {
  id: string;
  userId: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string | null;
  date: Date;
  receiptUrl: string | null;
  receiptDownloadUrl: string | null;
  categoryId?: string | null;
  isFromRecurring?: boolean;
  recurringPaymentId?: string | null;
}
