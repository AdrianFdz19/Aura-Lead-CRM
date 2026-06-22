
import { encrypt } from '@/lib/encryption';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const session = await getSession(); // Simulado: tu verificación de sesión
        console.log("Sesión obtenida:", session);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log("Datos recibidos:", body);
        const { permanentToken, phoneNumberId, wabaId, phoneNumber } = body;

        // 1. Encriptamos el token antes de guardarlo (before encrypting the token)
        const encryptedToken = encrypt(permanentToken);
        console.log("Token encriptado:", encryptedToken);

        // 2. Guardamos o actualizamos la configuración en la base de datos
        await prisma.whatsappConfig.upsert({
            where: {
                tenantId: session.tenantId
            },
            update: {
                phoneNumberId,
                wabaId,
                phoneNumber, // Ya no dará error tras el generate
                accessTokenEncrypted: encryptedToken,
            },
            create: {
                tenantId: session.tenantId, // Prisma acepta el ID directo si está marcado como @db.Uuid
                phoneNumberId,
                wabaId,
                phoneNumber, // Ya no dará error tras el generate
                accessTokenEncrypted: encryptedToken,
            },
        });

        return NextResponse.json({ success: true, message: 'Configuration saved successfully' });
    } catch (error) {
        /* return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 }); */
        console.error("DETALLE DEL ERROR:", JSON.stringify(error, null, 2));

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMeta = (error as any)?.meta;

        return NextResponse.json(
            { error: errorMessage, meta: errorMeta },
            { status: 500 }
        );
    }
}