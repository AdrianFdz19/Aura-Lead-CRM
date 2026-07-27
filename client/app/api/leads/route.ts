import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Construir la condición 'where' dinámicamente según el rol
    const whereCondition: any = {
      tenantId: session.tenantId,
    };

    // Si el usuario es AGENT, filtramos estrictamente por su ID de asignación
    if (session.role === 'AGENT') {
      whereCondition.assignedToId = session.userId; // Asegúrate de que tu sesión guarde el id del usuario como userId o id
    }

    const leads = await prisma.lead.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        lastMessage: true,
        phone: true,
        email: true,
        assignedToId: true,
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