import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Salvar ou atualizar dados do usuário
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Obter dados do usuário autenticado do Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Salvar ou atualizar o usuário no banco de dados
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: clerkUser.firstName 
          ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
          : clerkUser.username || "",
      },
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
          : clerkUser.username || "",
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Obter dados do usuário
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar usuário do banco de dados
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!user) {
      // Se o usuário não existir no banco de dados, vamos criá-lo
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      
      // Criar o usuário no banco de dados
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
            : clerkUser.username || "",
        },
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      });
      
      return NextResponse.json(newUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
} 