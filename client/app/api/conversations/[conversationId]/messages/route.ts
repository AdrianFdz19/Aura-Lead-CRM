// app/api/conversations/[conversationId]/messages/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { getSession } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {

    const session = await getSession();

    if (!session || !session.tenantId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json({ error: 'ID de conversación no proporcionado' }, { status: 400 });
        }

        // 1. Construimos el filtro de seguridad para la conversación padre
        const conversationFilter: any = {
            tenantId: session.tenantId, // Siempre validamos que la conversación sea del mismo tenant
        };

        // 2. Si es agente, agregamos la validación del dueño del lead
        if (session.role === 'AGENT') {
            conversationFilter.lead = {
                assignedToId: session.userId,
            };
        }

        const messages = await prisma.message.findMany({
            where: { 
                conversationId,
                conversation: conversationFilter 
            },
            orderBy: { createdAt: 'asc' }, // Muy importante: orden cronológico
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error en GET:", error);
        return NextResponse.json({ error: 'Error al obtener los mensajes' }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getSession();

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
        }

        const { messageText } = await req.json();

        if (!messageText) {
            return NextResponse.json({ error: 'El texto del mensaje es requerido' }, { status: 400 });
        }

        // 1. Construir la consulta con la seguridad estricta por rol
        const conversationQuery: any = {
            id: conversationId,
            tenantId: session.tenantId, // Validación fundamental de Tenant
        };

        // Si es agente, validamos obligatoriamente que el lead esté asignado a él
        if (session.role === 'AGENT') {
            conversationQuery.lead = {
                assignedToId: session.userId,
            };
        }

        // 1. Prisma consulta incluyendo la configuración de WhatsApp
        const conversation = await prisma.conversation.findUnique({
            where: conversationQuery,
            include: {
                lead: true,
                tenant: {
                    include: {
                        whatsappConfig: true
                    }
                }
            }
        });

        if (!conversation || !conversation.tenant.whatsappConfig) {
            return NextResponse.json({ error: 'Configuración de WhatsApp no encontrada' }, { status: 404 });
        }

        const config = conversation.tenant.whatsappConfig;

        // 2. Desencriptar token y obtener ID del config
        const token = decrypt(config.accessTokenEncrypted);
        const phoneId = config.phoneNumberId;

        // 3. Enviar a WhatsApp API
        const apiUrl ='https://graph.facebook.com';
        const apiVersion = 'v25.0';

        const response = await fetch(`${apiUrl}/${apiVersion}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: conversation.lead.waId,
                type: 'text',
                text: { body: messageText }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error:", data);
            return NextResponse.json({ error: 'Error al enviar mensaje vía WhatsApp' }, { status: response.status });
        }

        // 4. Persistir en tu BD
        const newMessage = await prisma.message.create({
            data: {
                tenantId: conversation.tenantId,
                conversationId: conversation.id,
                messageText: messageText,
                senderType: 'AGENT',
                metaMessageId: data.messages[0].id
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Error en POST:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}