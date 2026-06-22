// app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  // Obtenemos todas las conversaciones, incluyendo el lead y los mensajes (ordenados para traer el último)
  const conversations = await prisma.conversation.findMany({
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