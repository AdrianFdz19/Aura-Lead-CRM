// app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {

  // Fetch the conversations only from the actual session
  const session = await getSession();

  if (!session || !session.tenantId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Obtenemos todas las conversaciones, incluyendo el lead y los mensajes (ordenados para traer el último)
  const conversations = await prisma.conversation.findMany({
    where: {
      tenantId: session.tenantId,
    },
    orderBy: { lastMessageAt: 'desc' }, // Las más recientes primero
    include: {
      lead: {
        select: { name: true, waId: true }
      },
      messages: {
        take: 1, // Solo queremos el más reciente
        orderBy: { createdAt: 'desc' },
        select: { messageText: true, createdAt: true }
      }
    }
  });

  return NextResponse.json(conversations);
}