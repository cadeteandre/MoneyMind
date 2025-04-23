import { Transaction } from "@prisma/client";
import { Card } from "@/components/ui/card";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center">No transactions found.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{transaction.category}</p>
            {transaction.description && (
              <p className="text-sm text-muted-foreground">{transaction.description}</p>
            )}
          </div>
          <div className="text-right">
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
          </div>
        </Card>
      ))}
    </div>
  );
}