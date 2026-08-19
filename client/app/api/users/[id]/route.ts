import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Validar sesión de forma segura
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session?.tenantId;

    // Lista de IDs de tus tenants demo (puedes guardarlo en una variable de entorno)
    const DEMO_TENANTS = [process.env.DEMO_TENANT_ID];

    if (DEMO_TENANTS.includes(tenantId)) {
        return new Response(
            JSON.stringify({ error: "No permitido en modo demo" }),
            { status: 403 }
        );
    }

    try {
        const { id: userId } = await params;

        // Validar que el usuario en sesión solo pueda editar su propio perfil
        if (session.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, currentPassword, newPassword, avatar } = body;

        // Construir el objeto de datos dinámico para Prisma
        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (avatar !== undefined) updateData.avatar = avatar;

        // 2. Si el usuario intenta cambiar la contraseña, debemos validarla
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Debes proporcionar tu contraseña actual para establecer una nueva.' },
                    { status: 400 }
                );
            }

            // Buscar al usuario en la BD seleccionando 'passwordHash'
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { passwordHash: true }
            });

            if (!existingUser || !existingUser.passwordHash) {
                return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
            }

            // Verificar si la contraseña actual coincide con el hash guardado
            const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.passwordHash);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'La contraseña actual es incorrecta.' },
                    { status: 400 }
                );
            }

            // Si es válida, hasheamos la nueva contraseña y la asignamos a 'passwordHash'
            const saltRounds = 10;
            updateData.passwordHash = await bcrypt.hash(newPassword, saltRounds);
        }

        // 3. Ejecutar la actualización en la base de datos con Prisma
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                tenantId: true,
                isActive: true
            }
        });

        return NextResponse.json({
            message: 'Perfil actualizado exitosamente',
            user: updatedUser
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating user profile:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'El correo electrónico ya está registrado por otro usuario.' },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

