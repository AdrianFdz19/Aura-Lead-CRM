import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ leadId: string }>
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await getSession();
    if (!session || !session.tenantId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { assignedToId } = await request.json();
        const { leadId } = await params;

        // Validar que el lead pertenezca al tenant actual antes de actualizar
        const updatedLead = await prisma.lead.update({
            where: {
                id: leadId,
                tenantId: session.tenantId, // Seguridad multi-tenant crucial
            },
            data: {
                assignedToId: assignedToId || null, // Permite asignar el ID o desasignar enviando null/vencido
            },
        });

        return NextResponse.json({ success: true, lead: updatedLead }, { status: 200 });
    } catch (err) {
        console.error('Error assigning lead:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}