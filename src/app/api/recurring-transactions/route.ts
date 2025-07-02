import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { calculateNextDueDate, validateFrequencyParams } from "@/utils/recurringTransactionUtils";
import { RecurrenceFrequency } from "@/interfaces/IRecurringTransaction";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get authenticated user data
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Ensures that the user exists in the database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || user.username || "",
      },
    });

    // Process the request body
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
      endDate
    } = body;

    // Validate required fields
    if (!amount || !type || !category || !frequency || !startDate) {
      return NextResponse.json({ 
        error: "Missing required fields: amount, type, category, frequency, startDate" 
      }, { status: 400 });
    }

    // Validate frequency parameters
    const validation = validateFrequencyParams(frequency, dayOfMonth, dayOfWeek, customDays);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Calculate the next due date
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação de datas
    start.setHours(0, 0, 0, 0);
    
    let nextDueDate: Date;
    
    if (start <= today) {
      // Se a data de início é hoje ou no passado, o primeiro pagamento está pendente
      // Usar a própria startDate como primeiro vencimento
      nextDueDate = new Date(startDate);
      
      // Para frequências com dia específico, ajustar para o dia correto se necessário
      if (frequency === 'MONTHLY' || frequency === 'QUARTERLY' || frequency === 'SEMIANNUALLY' || frequency === 'ANNUALLY') {
        if (dayOfMonth !== null && dayOfMonth !== undefined) {
          const lastDayOfMonth = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate();
          const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
          nextDueDate.setDate(targetDay);
        }
      } else if (frequency === 'WEEKLY' || frequency === 'BIWEEKLY') {
        if (dayOfWeek !== null && dayOfWeek !== undefined) {
          const currentDayOfWeek = nextDueDate.getDay();
          if (currentDayOfWeek !== dayOfWeek) {
            // Se não é o dia correto da semana, ajustar para o próximo dia correto
            const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
            nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);
          }
        }
      }
    } else {
      // Se a data de início é no futuro, calcular normalmente
      nextDueDate = calculateNextDueDate(start, frequency, dayOfMonth, dayOfWeek, customDays);
    }

    // Create the recurring transaction
    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        amount: amount.toString(),
        type,
        category,
        categoryId,
        description,
        frequency,
        dayOfMonth,
        dayOfWeek,
        customDays,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        userId,
      },
      include: {
        categoryReference: true,
        recurringPayments: {
          where: {
            status: 'PENDING'
          },
          orderBy: { dueDate: 'asc' },
          take: 5
        }
      }
    });

    return NextResponse.json(recurringTransaction, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get("isActive");
  const frequency = searchParams.get("frequency");
  const includePending = searchParams.get("includePending") === "true";

  // Build where clause dynamically
  const whereClause: Prisma.RecurringTransactionWhereInput = {
    userId,
  };

  if (isActive !== null) {
    whereClause.isActive = isActive === "true";
  }

  if (frequency) {
    whereClause.frequency = frequency as RecurrenceFrequency;
  }

  try {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: whereClause,
      include: {
        categoryReference: true,
        recurringPayments: includePending ? {
          where: {
            status: 'PENDING'
          },
          orderBy: { dueDate: 'asc' },
          take: 3
        } : false,
        _count: {
          select: {
            recurringPayments: {
              where: { status: 'PAID' }
            }
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { nextDueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Calculate summary statistics for each recurring transaction
    const recurringTransactionsWithStats = await Promise.all(
      recurringTransactions.map(async (rt) => {
        const [totalPaid, totalPending, lastPayment] = await Promise.all([
          prisma.recurringPayment.aggregate({
            where: {
              recurringTransactionId: rt.id,
              status: 'PAID'
            },
            _sum: { amount: true }
          }),
          prisma.recurringPayment.aggregate({
            where: {
              recurringTransactionId: rt.id,
              status: 'PENDING'
            },
            _sum: { amount: true }
          }),
          prisma.recurringPayment.findFirst({
            where: {
              recurringTransactionId: rt.id,
              status: 'PAID'
            },
            orderBy: { paidDate: 'desc' }
          })
        ]);

        return {
          ...rt,
          totalPaid: Number(totalPaid._sum.amount || 0),
          totalPending: Number(totalPending._sum.amount || 0),
          lastPayment
        };
      })
    );

    return NextResponse.json(recurringTransactionsWithStats);
  } catch (error) {
    console.error("GET /api/recurring-transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch recurring transactions" }, { status: 500 });
  }
} 