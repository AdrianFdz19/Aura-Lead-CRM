
import { encrypt } from '@/lib/encryption';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const session = await getSession(); // Simulado: tu verificación de sesión
        console.log("Sesión obtenida:", session);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log("Datos recibidos:", body);
        const { accessToken, phoneNumberId, wabaId, phoneNumber } = body;

        // 1. Buscamos si ya existe una configuración previa para este tenant
        const existingConfig = await prisma.whatsappConfig.findUnique({
            where: { tenantId: session.tenantId }
        });

        let encryptedToken: string;

        // 2. Evaluamos según el escenario (Creación vs Actualización)
        if (!existingConfig) {
            // ESCENARIO A: Es una cuenta NUEVA. El token es obligatorio.
            if (!accessToken || accessToken.trim() === '') {
                return NextResponse.json(
                    { error: 'El token de acceso es obligatorio para la configuración inicial.' },
                    { status: 400 }
                );
            }
            encryptedToken = encrypt(accessToken);
        } else {
            // ESCENARIO B: Es una ACTUALIZACIÓN. El token es opcional.
            if (accessToken && accessToken.trim() !== '') {
                // Si mandaron uno nuevo, lo encriptamos
                encryptedToken = encrypt(accessToken);
            } else {
                // Si lo dejaron vacío, conservamos el que ya estaba guardado
                encryptedToken = existingConfig.accessTokenEncrypted;
            }
        }

        // 3. Guardamos o actualizamos usando upsert de manera segura
        await prisma.whatsappConfig.upsert({
            where: {
                tenantId: session.tenantId
            },
            update: {
                phoneNumberId,
                wabaId,
                phoneNumber,
                accessTokenEncrypted: encryptedToken, // Usa el nuevo o conserva el anterior
            },
            create: {
                tenantId: session.tenantId,
                phoneNumberId,
                wabaId,
                phoneNumber,
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