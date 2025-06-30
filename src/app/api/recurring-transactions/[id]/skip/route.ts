import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateNextDueDate } from "@/utils/recurringTransactionUtils";

// POST - Skip a recurring transaction payment (without creating a transaction)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { notes } = body;

    // Find the recurring transaction
    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!recurringTransaction) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 });
    }

    // Check if user owns this recurring transaction
    if (recurringTransaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if recurring transaction is active
    if (!recurringTransaction.isActive) {
      return NextResponse.json({ error: "Recurring transaction is not active" }, { status: 400 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create a skipped payment record (without creating a transaction)
      const recurringPayment = await tx.recurringPayment.create({
        data: {
          recurringTransactionId: id,
          transactionId: null, // No transaction created for skipped payments
          dueDate: recurringTransaction.nextDueDate,
          paidDate: null, // No payment date for skipped payments
          status: 'SKIPPED',
          amount: recurringTransaction.amount,
          notes: notes || 'Skipped by user',
        },
      });

      // Calculate the next due date (skip to next occurrence)
      const nextDueDate = calculateNextDueDate(
        recurringTransaction.nextDueDate,
        recurringTransaction.frequency,
        recurringTransaction.dayOfMonth,
        recurringTransaction.dayOfWeek,
        recurringTransaction.customDays
      );

      // Update the recurring transaction with new next due date
      const updatedRecurringTransaction = await tx.recurringTransaction.update({
        where: { id },
        data: {
          nextDueDate,
          lastProcessedDate: new Date(), // Mark as processed but not paid
        },
        include: {
          categoryReference: true,
          recurringPayments: {
            where: {
              status: 'PENDING'
            },
            orderBy: { dueDate: 'asc' },
            take: 3
          }
        }
      });

      return {
        recurringPayment,
        recurringTransaction: updatedRecurringTransaction
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/recurring-transactions/[id]/skip error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 