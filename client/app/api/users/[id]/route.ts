import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Validar sesión de forma segura
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: userId } = await params;
        const body = await request.json();
        const { avatar } = body;

        // 2. Actualizar la columna 'avatar' usando Prisma
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                avatar: avatar
            },
        });

        return NextResponse.json({
            message: 'User avatar updated successfully',
            user: updatedUser
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating user avatar:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Validar sesión de forma segura
    const session = await getSession();

    if (!session || !session.tenantId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Solamente el ADMIN puede ejecutar esta accion
    if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario no proporcionado' }, { status: 400 });
        }

        // 2. Verificar que el usuario existe y pertenece al mismo tenant (¡con await!)
        const userToEliminate = await prisma.user.findFirst({
            where: { 
                id: userId,
                tenantId: session.tenantId, // Blindaje multi-tenant
            },
        });

        if (!userToEliminate) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Evitar que el admin se borre a sí mismo por accidente
        if (userToEliminate.id === session.userId) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
        }

        // 3. Liberar los leads asignados a este agente (poner assignedToId en null)
        await prisma.lead.updateMany({
            where: { assignedToId: userId },
            data: { assignedToId: null },
        });

        // 4. Eliminar al usuario definitivamente
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: 'Agente eliminado exitosamente y leads liberados' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};

