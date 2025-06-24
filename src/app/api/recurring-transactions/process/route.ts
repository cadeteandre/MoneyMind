import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runRecurringTransactionProcessor } from "@/utils/recurringProcessor";

// POST - Run the recurring transaction processor manually
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For security, you might want to restrict this to admin users only
    // For now, any authenticated user can trigger the processor
    
    const result = await runRecurringTransactionProcessor();
    
    return NextResponse.json({
      message: "Recurring transaction processor completed successfully",
      ...result
    });
  } catch (error) {
    console.error("POST /api/recurring-transactions/process error:", error);
    return NextResponse.json({ 
      error: "Failed to run recurring transaction processor",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET - Get status of recurring transactions that need processing
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    
    const today = new Date();
    
    // Count transactions that need processing
    const needsProcessing = await prisma.recurringTransaction.count({
      where: {
        isActive: true,
        nextDueDate: {
          lte: today
        }
      }
    });

    // Count overdue payments
    const overduePayments = await prisma.recurringPayment.count({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      }
    });

    // Get last processed transactions
    const lastProcessed = await prisma.recurringTransaction.findMany({
      where: {
        lastProcessedDate: {
          not: null
        }
      },
      orderBy: {
        lastProcessedDate: 'desc'
      },
      take: 5,
      select: {
        id: true,
        category: true,
        amount: true,
        lastProcessedDate: true,
        nextDueDate: true
      }
    });

    return NextResponse.json({
      needsProcessing,
      overduePayments,
      lastProcessed,
      timestamp: today
    });
  } catch (error) {
    console.error("GET /api/recurring-transactions/process error:", error);
    return NextResponse.json({ 
      error: "Failed to get processing status" 
    }, { status: 500 });
  }
} 