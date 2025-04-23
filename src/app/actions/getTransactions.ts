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

  return await prisma.transaction.findMany({
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
}