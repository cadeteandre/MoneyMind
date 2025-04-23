"use client";

import { useEffect, useState } from "react";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@prisma/client";
import { getTransactions } from "@/app/actions/getTransactions";

export default function DashboardClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async (startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start", startDate.toISOString());
    if (endDate) params.append("end", endDate.toISOString());

    const res = await fetch(`/api/transactions?${params.toString()}`);
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTransactions({});
      setTransactions(data);
    };

    fetchData();
  }, []);

  return (
    <>
      <section className="p-4 flex flex-col gap-4">
        <DateRangeFilter onFilter={fetchTransactions} />
        <TransactionList transactions={transactions} />
      </section>
    </>
  );
}
