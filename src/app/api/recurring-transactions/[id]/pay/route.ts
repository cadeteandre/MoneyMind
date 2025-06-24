import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateNextDueDate } from "@/utils/recurringTransactionUtils";

// POST - Mark a recurring transaction payment as paid
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
    const { amount, notes, paymentDate } = body;

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

    const paidDate = paymentDate ? new Date(paymentDate) : new Date();
    const paymentAmount = amount || Number(recurringTransaction.amount);

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create a new transaction for this payment
      const transaction = await tx.transaction.create({
        data: {
          amount: paymentAmount.toString(),
          type: recurringTransaction.type,
          category: recurringTransaction.category,
          categoryId: recurringTransaction.categoryId,
          description: recurringTransaction.description,
          date: paidDate,
          userId,
        },
      });

      // Create or update the recurring payment record
      const recurringPayment = await tx.recurringPayment.create({
        data: {
          recurringTransactionId: id,
          transactionId: transaction.id,
          dueDate: recurringTransaction.nextDueDate,
          paidDate,
          status: 'PAID',
          amount: paymentAmount.toString(),
          notes,
        },
      });

      // Calculate the next due date
      const nextDueDate = calculateNextDueDate(
        recurringTransaction.nextDueDate,
        recurringTransaction.frequency,
        recurringTransaction.dayOfMonth,
        recurringTransaction.dayOfWeek,
        recurringTransaction.customDays
      );

      // Update the recurring transaction with new next due date and last processed date
      const updatedRecurringTransaction = await tx.recurringTransaction.update({
        where: { id },
        data: {
          nextDueDate,
          lastProcessedDate: paidDate,
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
        transaction,
        recurringPayment,
        recurringTransaction: updatedRecurringTransaction
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/recurring-transactions/[id]/pay error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET - Get pending payments for a recurring transaction
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Get current payment info
    const today = new Date();
    const isOverdue = recurringTransaction.nextDueDate < today;
    
    const currentPayment = {
      id: `pending-${id}`,
      recurringTransactionId: id,
      dueDate: recurringTransaction.nextDueDate,
      amount: Number(recurringTransaction.amount),
      status: isOverdue ? 'OVERDUE' : 'PENDING',
      isOverdue,
      daysUntilDue: Math.ceil((recurringTransaction.nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    };

    return NextResponse.json({
      recurringTransaction,
      currentPayment
    });
  } catch (error) {
    console.error("GET /api/recurring-transactions/[id]/pay error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 