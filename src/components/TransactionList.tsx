"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/app/actions/getTransactions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Transaction } from "@prisma/client";

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTransactions({});
      setTransactions(data);
    };

    fetchData();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      {transactions.map((tx) => (
        <Card key={tx.id} className="hover:shadow-md transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">{tx.category}</span>
              <Badge variant={tx.type === "INCOME" ? "success" : "destructive"}>
                {tx.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{tx.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{format(new Date(tx.date), "dd/MM/yyyy")}</span>
              <span className={tx.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                {tx.type === "INCOME" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}