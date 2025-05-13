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

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    let user;
    
    if (existingUser) {
      // Atualizar usuário existente
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: clerkUser.firstName 
            ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
            : clerkUser.username || ""
        }
      });
    } else {
      // Criar um novo usuário
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
            : clerkUser.username || "",
          // O valor padrão 'EUR' será usado para currency conforme o schema
        }
      });
    }

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
    console.log("GET /api/user - Buscando usuário:", userId);
    
    // Buscar usuário do banco de dados com contagem de transações
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });
    
    if (!user) {
      console.log("Usuário não encontrado, criando novo usuário");
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
          // O valor padrão 'EUR' será usado para currency conforme o schema
        },
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      });
      
      console.log("Novo usuário criado:", newUser);
      return NextResponse.json(newUser);
    }
    
    console.log("Usuário encontrado:", user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
} 