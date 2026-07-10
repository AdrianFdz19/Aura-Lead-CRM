// app/api/leads/[leadId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Pusher from "pusher"

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export async function DELETE(
    req: Request,
    { params }: { params: { leadId: string } }
) {
    const session = await getSession();
    if (!session || !session.tenantId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { leadId } = params;

    try {
        // Opcional: Primero borra o desvincula registros dependientes si es necesario
        // (ej: mensajes, conversaciones). Prisma puede requerir esto.
        // Por simplicidad, asumimos que se puede borrar directamente.
        await prisma.lead.delete({
            where: {
                id: leadId,
                tenantId: session.tenantId, // Asegura que solo borres leads de tu tenant
            },
        });

        // ¡La parte clave! Notificar a todos los clientes conectados.
        await pusher.trigger(`tenant-${session.tenantId}`, "lead-deleted", {
            leadId: leadId,
        });

        return NextResponse.json({ message: 'Lead eliminado' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar lead:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
