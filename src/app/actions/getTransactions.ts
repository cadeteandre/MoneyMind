"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getTransactions({
  type,
  category,
  startDate,
  endDate
}: {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { userId } = await auth();

  if (!userId) return [];

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    },
    orderBy: {
      date: "desc",
    },
  });

  // Converter amount para number e garantir que date seja sempre um Date
  return transactions.map(t => ({
    ...t,
    amount:
      typeof t.amount === 'string'
        ? parseFloat(t.amount)
        : typeof t.amount === 'object' && t.amount !== null && 'toNumber' in t.amount
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (t.amount as any).toNumber()
        : Number(t.amount),
    date: new Date(t.date) // Garantir que date seja sempre um Date
  }));
}