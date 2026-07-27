import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from 'resend';
import { hash } from 'bcryptjs';
import { getPublicUrl } from "@/lib/s3";

const resend = new Resend(process.env.RESEND_API_KEY);
const mainEmail = process.env.EMAIL;

export async function GET(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                tenantId: session.tenantId,
            },
            include: {
                assignedLeads: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Procesamos los avatares de cada usuario de forma segura en paralelo
        const usersWithAvatar = await Promise.all(
            users.map(async (u) => {
                let avatarUrl = null;

                if (u.avatar) {
                    try {
                        avatarUrl = await getPublicUrl(u.avatar);
                    } catch (err) {
                        console.error(`Error getting public url for user ${u.id}:`, err);
                    }
                }

                return {
                    ...u,
                    avatar: avatarUrl,
                };
            })
        );

        return NextResponse.json(usersWithAvatar, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { agentData } = body;

        if (!agentData || !agentData.name || !agentData.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

    // --- MEJORA DE SEGURIDAD ---
    // Solo un ADMIN puede crear nuevos usuarios.
    if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Only admins can create users.' }, { status: 403 });
    }

        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await hash(tempPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                tenantId: session.tenantId,
                name: agentData.name,
                email: agentData.email,
                phone: agentData.phone || null,
                role: agentData.role === 'Admin' ? 'ADMIN' : 'AGENT',
                isActive: agentData.status === 'Active',
                passwordHash: passwordHash,
            },
        });

        // 2. Enviar el correo con Resend conteniendo la contraseña temporal
        await resend.emails.send({
            from: 'Resend <onboarding@resend.dev>', // Cambia por tu correo verificado en Resend
            to: `${mainEmail}`,
            subject: '¡Bienvenido al equipo! Tus credenciales de acceso',
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #4f46e5;">¡Hola, ${agentData.name}!</h2>
                    <p>Has sido registrado como agente. Ya puedes iniciar sesión para comenzar a gestionar tus leads.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Correo electrónico:</strong> ${agentData.email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">Te recomendamos iniciar sesión y cambiar tu contraseña lo antes posible.</p>
                    
                    <a href="${process.env.NEXT_PUBLIC_URL}/login" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Iniciar Sesión</a>
                </div>
            `,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
