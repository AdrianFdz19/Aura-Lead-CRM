
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption'; // Asegúrate de tener esta función de encriptación
import { getSession } from '@/lib/auth';

// GET
export async function GET(req: Request) {
    try {
        // Verificar la sesión del usuario
        const session = await getSession();

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Buscar la configuración en la base de datos (relación 1 a 1)
        const llmConfig = await prisma.tenantLlmConfig.findUnique({
            where: { tenantId: session.tenantId },
            select: {
                provider: true,
                modelName: true,
                // Ocultamos intencionalmente la apiKeyEncrypted por seguridad en el GET del cliente
            },
        });

        return NextResponse.json(
            { 
                llmConfig: llmConfig || null 
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error al obtener la configuración de LLM:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al consultar la configuración' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // Verificar la sesión del usuario
        const session = await getSession();

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { provider, modelName, apiKey } = body;

        // 2. Validaciones básicas de campos obligatorios
        if (!provider || !modelName) {
            return NextResponse.json(
                { error: 'El proveedor y el nombre del modelo son obligatorios' },
                { status: 400 }
            );
        }

        // 3. Manejo de la API Key (Opcional en actualización)
        // Buscamos si ya existe una configuración previa para este tenant
        const existingConfig = await prisma.tenantLlmConfig.findUnique({
            where: { tenantId: session.tenantId },
        });

        // Si no hay API Key nueva y tampoco existe una previa, requerimos el campo
        if (!apiKey && (!existingConfig || !existingConfig.apiKeyEncrypted)) {
            return NextResponse.json(
                { error: 'La API Key es obligatoria para la configuración inicial' },
                { status: 400 }
            );
        }

        // Definimos qué API Key vamos a guardar:
        // Si el usuario envió una nueva, la usamos (puedes cifrarla aquí con tu librería de encriptación).
        // Si dejó el campo vacío, conservamos la que ya estaba guardada en la base de datos.
        const apiKeyToSave = apiKey
            ? encrypt(apiKey)
            : existingConfig?.apiKeyEncrypted;

        if (!apiKeyToSave) {
            return NextResponse.json(
                { error: 'API Key inválida o no proporcionada' },
                { status: 400 }
            );
        }

        // 4. Operación Upsert de Prisma (Crea si no existe, actualiza si ya existe)
        const updatedOrCreatedConfig = await prisma.tenantLlmConfig.upsert({
            where: { tenantId: session.tenantId },
            update: {
                provider,
                modelName,
                apiKeyEncrypted: apiKeyToSave,
            },
            create: {
                tenantId: session.tenantId,
                provider,
                modelName,
                apiKeyEncrypted: apiKeyToSave,
            },
        });

        return NextResponse.json(
            {
                message: 'Configuración de LLM guardada exitosamente',
                config: {
                    provider: updatedOrCreatedConfig.provider,
                    modelName: updatedOrCreatedConfig.modelName,
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error al guardar la configuración de LLM:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar la configuración' },
            { status: 500 }
        );
    }
}