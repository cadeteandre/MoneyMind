import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isOverdue, getDaysUntilDue } from "@/utils/recurringTransactionUtils";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const includeOverdue = searchParams.get("includeOverdue") === "true";
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    // Get all active recurring transactions for the user
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

    // Get existing recurring payments (to avoid duplicates)
    const existingPayments = await prisma.recurringPayment.findMany({
      where: {
        recurringTransaction: {
          userId,
          isActive: true
        },
        status: 'PENDING'
      },
      include: {
        recurringTransaction: {
          include: {
            categoryReference: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    // Create a list of current pending payments based on recurring transactions
    const pendingPayments = recurringTransactions.map((rt) => {
      const dueDate = rt.nextDueDate;
      const isOverduePayment = isOverdue(dueDate);
      
      // Check if there's already a pending payment for this due date
      const existingPayment = existingPayments.find(
        (ep) => ep.recurringTransactionId === rt.id && 
        ep.dueDate.getTime() === dueDate.getTime()
      );

      if (existingPayment) {
        return {
          ...existingPayment,
          amount: Number(existingPayment.amount),
          isOverdue: isOverduePayment,
          daysUntilDue: getDaysUntilDue(dueDate),
          recurringTransaction: rt
        };
      }

      // Create virtual pending payment
      return {
        id: `pending-${rt.id}`,
        recurringTransactionId: rt.id,
        dueDate,
        amount: Number(rt.amount),
        status: isOverduePayment ? 'OVERDUE' : 'PENDING',
        isOverdue: isOverduePayment,
        daysUntilDue: getDaysUntilDue(dueDate),
        recurringTransaction: rt,
        notes: null,
        createdAt: rt.createdAt,
        updatedAt: rt.updatedAt
      };
    });

    // Filter based on status if specified
    let filteredPayments = pendingPayments;
    
    if (status === 'OVERDUE') {
      filteredPayments = pendingPayments.filter(p => p.isOverdue);
    } else if (status === 'PENDING') {
      filteredPayments = pendingPayments.filter(p => !p.isOverdue);
    } else if (status === 'DUE_TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filteredPayments = pendingPayments.filter(p => {
        const dueDate = new Date(p.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (status === 'DUE_THIS_WEEK') {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      
      filteredPayments = pendingPayments.filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate >= today && dueDate <= weekFromNow;
      });
    }

    // If not including overdue, filter them out (unless specifically requesting overdue)
    if (!includeOverdue && status !== 'OVERDUE') {
      filteredPayments = filteredPayments.filter(p => !p.isOverdue);
    }

    // Apply limit
    filteredPayments = filteredPayments.slice(0, limit);

    // Calculate summary statistics
    const stats = {
      total: pendingPayments.length,
      overdue: pendingPayments.filter(p => p.isOverdue).length,
      dueToday: pendingPayments.filter(p => p.daysUntilDue === 0).length,
      dueThisWeek: pendingPayments.filter(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 7).length,
      totalAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      overdueAmount: pendingPayments.filter(p => p.isOverdue).reduce((sum, p) => sum + p.amount, 0)
    };

    return NextResponse.json({
      payments: filteredPayments,
      stats
    });
  } catch (error) {
    console.error("GET /api/recurring-payments error:", error);
    return NextResponse.json({ error: "Failed to fetch recurring payments" }, { status: 500 });
  }
} 