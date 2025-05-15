import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: userId as string },
      select: { locale: true },
    });

    return NextResponse.json({ locale: user?.locale || 'pt' });
  } catch (error) {
    console.error('Error fetching user language preference:', error);
    return NextResponse.json({ error: 'Failed to fetch language preference' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { locale } = await request.json();
    
    // Validar se o locale é suportado
    if (!['pt', 'en', 'es', 'de'].includes(locale)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Tentar encontrar o usuário primeiro
    const user = await prisma.user.findFirst({
      where: { clerkId: userId as string },
    });

    if (user) {
      // Atualizar a preferência de idioma do usuário existente
      await prisma.user.update({
        where: { id: user.id },
        data: { locale },
      });
    } else {
      // Criar um novo usuário se não existir
      await prisma.user.create({
        data: {
          clerkId: userId as string,
          email: `user-${userId}@example.com`, // Placeholder, será atualizado pelo middleware
          locale,
        },
      });
    }

    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Error updating user language preference:', error);
    return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
  }
} 