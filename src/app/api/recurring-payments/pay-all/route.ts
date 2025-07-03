import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateNextDueDate } from "@/utils/recurringTransactionUtils";

// POST - Pay all pending payments at once
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active recurring transactions with pending payments
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        categoryReference: true,
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each recurring transaction
    for (const rt of recurringTransactions) {
      try {
        results.processed++;

        const paidDate = new Date();
        const paymentAmount = Number(rt.amount);

        // Use a transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Create a new transaction for this payment
          const transaction = await tx.transaction.create({
            data: {
              amount: paymentAmount.toString(),
              type: rt.type,
              category: rt.category,
              categoryId: rt.categoryId,
              description: rt.description,
              date: paidDate,
              userId,
            },
          });

          // Create the recurring payment record
          await tx.recurringPayment.create({
            data: {
              recurringTransactionId: rt.id,
              transactionId: transaction.id,
              dueDate: rt.nextDueDate,
              paidDate,
              status: 'PAID',
              amount: paymentAmount.toString(),
              notes: 'Paid via bulk payment',
            },
          });

          // Calculate the next due date
          const nextDueDate = calculateNextDueDate(
            rt.nextDueDate,
            rt.frequency,
            rt.dayOfMonth,
            rt.dayOfWeek,
            rt.customDays
          );

          // Update the recurring transaction with new next due date and last processed date
          await tx.recurringTransaction.update({
            where: { id: rt.id },
            data: {
              nextDueDate,
              lastProcessedDate: paidDate,
            },
          });
        });

        results.succeeded++;
      } catch (error) {
        results.failed++;
        const errorMsg = `Error processing ${rt.category}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      message: "Bulk payment processing completed",
      results
    });
  } catch (error) {
    console.error("POST /api/recurring-payments/pay-all error:", error);
    return NextResponse.json({ 
      error: "Failed to process bulk payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 