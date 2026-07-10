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
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        lastMessage: true,
        phone: true,
        email: true
        // Puedes agregar otros campos simples aquí si los necesitas
      },
      orderBy: { updatedAt: 'desc' }, // O 'createdAt', según prefieras
    });

    console.log(leads);
    return NextResponse.json(leads, { status: 200 });

  } catch (error) {
    console.error("Error al obtener leads:", error); // Útil para debug
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}