import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Obtem dados do usuário autenticado
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Garante que o usuário exista no banco de dados
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || user.username || "",
      },
    });

    // Processa o corpo da requisição
    const body = await req.json();
    const { amount, type, category, description, date } = body;

    if (!amount || !type || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Cria a transação
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}