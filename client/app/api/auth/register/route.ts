import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Define the validation schema for registration
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    companyName: z.string().min(2, 'Company name is too short'),
    adminName: z.string().min(2, 'Admin name is too short'),
    selectedPlan: z.enum(['basic', 'professional', 'enterprise'], {
        message: 'Invalid subscription plan selected',
    }),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validate input data with Zod
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation error', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { email, password, companyName, adminName, selectedPlan } = validation.data;

        // 2. Check if the user already exists to provide a friendly message
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const hashedPassword = await hash(password, 10);
        const slug = companyName.toLowerCase().trim().replace(/\s+/g, '-');

        // 3. Create user and tenant in a single transaction
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name: adminName,
                role: 'ADMIN',
                tenant: {
                    create: {
                        name: companyName,
                        slug: slug,
                        subscription: {
                            create: {
                                plan: selectedPlan,
                                status: 'pending_payment'
                            }
                        }
                    }
                }
            },
        });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ userId: newUser.id, tenantId: newUser.tenantId, role: newUser.role, status: 'pending_payment' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        (await cookies()).set('session', token, {
            httpOnly: true,
            secure: false, // Cambiar esto para cuando este en producción
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({
            message: 'User created successfully',
            userId: newUser.id,
            tenantId: newUser.tenantId,
            plan: selectedPlan // <--- Devuelve el plan al cliente
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
    }
}