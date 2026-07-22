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
}