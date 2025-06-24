import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateNextDueDate, validateFrequencyParams } from "@/utils/recurringTransactionUtils";

// GET - Get a specific recurring transaction
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
    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id },
      include: {
        categoryReference: true,
        recurringPayments: {
          orderBy: { dueDate: 'desc' },
          take: 10,
          include: {
            transaction: true
          }
        },
        _count: {
          select: {
            recurringPayments: {
              where: { status: 'PAID' }
            }
          }
        }
      }
    });

    if (!recurringTransaction) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 });
    }

    // Check if user owns this recurring transaction
    if (recurringTransaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Calculate statistics
    const [totalPaid, totalPending] = await Promise.all([
      prisma.recurringPayment.aggregate({
        where: {
          recurringTransactionId: id,
          status: 'PAID'
        },
        _sum: { amount: true }
      }),
      prisma.recurringPayment.aggregate({
        where: {
          recurringTransactionId: id,
          status: 'PENDING'
        },
        _sum: { amount: true }
      })
    ]);

    const result = {
      ...recurringTransaction,
      totalPaid: Number(totalPaid._sum.amount || 0),
      totalPending: Number(totalPending._sum.amount || 0)
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/recurring-transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - Update a recurring transaction
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the recurring transaction
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

    // Parse request body
    const body = await req.json();
    const { 
      amount, 
      type, 
      category, 
      categoryId,
      description, 
      frequency,
      dayOfMonth,
      dayOfWeek,
      customDays,
      startDate,
      endDate,
      isActive
    } = body;

    // Validate frequency parameters if frequency is being updated
    if (frequency) {
      const validation = validateFrequencyParams(frequency, dayOfMonth, dayOfWeek, customDays);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Calculate new next due date if frequency or timing parameters changed
    let nextDueDate = recurringTransaction.nextDueDate;
    if (frequency || dayOfMonth !== undefined || dayOfWeek !== undefined || customDays !== undefined || startDate) {
      const currentFreq = frequency || recurringTransaction.frequency;
      const currentDayOfMonth = dayOfMonth !== undefined ? dayOfMonth : recurringTransaction.dayOfMonth;
      const currentDayOfWeek = dayOfWeek !== undefined ? dayOfWeek : recurringTransaction.dayOfWeek;
      const currentCustomDays = customDays !== undefined ? customDays : recurringTransaction.customDays;
      const currentStartDate = startDate ? new Date(startDate) : recurringTransaction.startDate;
      
      nextDueDate = calculateNextDueDate(
        currentStartDate,
        currentFreq,
        currentDayOfMonth,
        currentDayOfWeek,
        currentCustomDays
      );
    }

    // Update the recurring transaction
    const updatedRecurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: amount.toString() }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        ...(frequency !== undefined && { frequency }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(customDays !== undefined && { customDays }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
        nextDueDate
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

    return NextResponse.json(updatedRecurringTransaction);
  } catch (error) {
    console.error("PUT /api/recurring-transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete a recurring transaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the recurring transaction to delete
    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id },
      include: {
        recurringPayments: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    if (!recurringTransaction) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 });
    }
    
    // Check if user owns this recurring transaction
    if (recurringTransaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete all pending recurring payments first (paid ones are kept for history)
      await tx.recurringPayment.deleteMany({
        where: {
          recurringTransactionId: id,
          status: 'PENDING'
        }
      });

      // Delete the recurring transaction (this will cascade to remaining payments due to schema)
      await tx.recurringTransaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/recurring-transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 