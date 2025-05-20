import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { locale: true },
    });

    return NextResponse.json({ locale: user?.locale || 'en' });
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      // Atualizar a preferência de idioma do usuário existente
      await prisma.user.update({
        where: { id: userId },
        data: { locale },
      });
    } else {
      // Se o usuário não existir, retornar erro
      // O usuário deve ser criado pelo middleware primeiro
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Error updating user language preference:', error);
    return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
  }
} 