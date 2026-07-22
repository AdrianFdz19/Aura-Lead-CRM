import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from 'bcryptjs';
import { getPublicUrl } from "@/lib/s3";

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

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
