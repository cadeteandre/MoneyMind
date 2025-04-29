import { Transaction as PrismaTransaction } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

// Extend the Transaction type to include receiptUrl
interface Transaction extends PrismaTransaction {
  receiptUrl?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center">No transactions found.</p>;
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4 flex justify-between items-center w-full">
          <div>
            <p className="font-medium text-center">{transaction.category}</p>
            {transaction.description ? (
              <p className="text-sm text-muted-foreground">{transaction.description}</p>
            ): null}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p
              className={`font-semibold ${
                transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
              }`}
            >
              {transaction.type === "INCOME" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString("pt-BR")}
            </p>
            {transaction.receiptUrl && (
              <Dialog open={openId === transaction.id} onOpenChange={(open) => {
                setOpenId(open ? transaction.id : null);
                setImgUrl(open ? transaction.receiptUrl ?? null : null);
              }}>
                <DialogTrigger asChild>
                  <button className="text-blue-600 underline text-xs">View Receipt</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Receipt</DialogTitle>
                  </DialogHeader>
                  {imgUrl && (
                    <img src={imgUrl} alt="Receipt" className="max-w-full max-h-[60vh] mx-auto rounded shadow" />
                  )}
                  <DialogClose />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}