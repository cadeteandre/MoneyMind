import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type TransactionFilters = {
  userId: string;
  date?: {
    gte: Date;
    lte: Date;
  };
};

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
    const { amount, type, category, description, date, receiptUrl, receiptDownloadUrl } = body;

    if (!amount || !type || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: amount.toString(),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        userId,
        receiptUrl,
        receiptDownloadUrl
      } as import('@prisma/client').Prisma.TransactionUncheckedCreateInput,
    });

    return NextResponse.json(transaction, { status: 201 });
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
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const filters: TransactionFilters = {
    userId,
  };

  if (start && end) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    filters.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}