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

    // Verificar se o usuário já existe pelo ID ou email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: clerkUser.emailAddresses[0].emailAddress }
        ]
      }
    });

    let user;
    
    if (existingUser) {
      // Atualizar usuário existente
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          id: userId, // Garantir que o ID está correto
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
            : clerkUser.username || "",
          // Manter o locale existente se já estiver definido
          locale: existingUser.locale || "en"
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
          locale: "en" // Definir explicitamente o locale padrão
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
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: clerkUser.emailAddresses[0].emailAddress }
        ]
      },
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
          locale: "en" // Definir explicitamente o locale padrão
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