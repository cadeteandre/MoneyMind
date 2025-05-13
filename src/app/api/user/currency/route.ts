import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CURRENCY_OPTIONS } from "@/lib/utils";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currency } = await request.json();

    // Validate currency
    if (!currency || !CURRENCY_OPTIONS[currency]) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Atualizar a moeda do usuário
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "currency" = '${currency}' WHERE "id" = '${userId}'`
    );

    return NextResponse.json({ 
      success: true, 
      currency: currency 
    });
  } catch (error) {
    console.error("Currency update error:", error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
} 