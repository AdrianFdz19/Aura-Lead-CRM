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

  // 1. Construir el 'where' base para el tenant
  const whereCondition: any = {
    tenantId: session.tenantId,
  };

  // 2. Si es agente, filtramos las conversaciones cuyo lead asociado esté asignado a este usuario
  if (session.role === 'AGENT') {
    whereCondition.lead = {
      assignedToId: session.userId,
    };
  }

  // Obtenemos todas las conversaciones, incluyendo el lead y los mensajes (ordenados para traer el último)
  const conversations = await prisma.conversation.findMany({
    where: whereCondition,
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