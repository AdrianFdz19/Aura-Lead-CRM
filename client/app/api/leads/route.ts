import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: {
        tenantId: session.tenantId,
      },
      include: {
        // Accedemos a la conversación del lead
        conversations: {
          include: {
            // Y luego a los mensajes de esa conversación
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Obtenemos solo el más reciente
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mapeo opcional para que la respuesta sea más limpia en el frontend
    const formattedLeads = leads.map(lead => ({
      ...lead,
      lastMessage: lead.conversations[0]?.messages[0]?.messageText || "Sin mensajes aún"
    }));

    return NextResponse.json(formattedLeads, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}