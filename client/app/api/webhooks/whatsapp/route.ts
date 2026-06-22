import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. VERIFICACIÓN (GET): Meta llama a esto para validar tu URL
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // El VERIFY_TOKEN es una cadena secreta que tú defines en el Dashboard de Meta
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse('Forbidden', { status: 403 });
}

// 2. RECEPCIÓN (POST): Meta envía el mensaje aquí
export async function POST(req: Request) {
    const body = await req.json();
    console.log('Webhook recibido:', JSON.stringify(body, null, 2));
    const entry = body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const messageData = value?.messages?.[0];
    const contactData = value?.contacts?.[0];
    const metadata = value?.metadata;

    if (!messageData || !metadata) return NextResponse.json({ status: 'ok' });

    // 1. Identificar el Tenant
    const config = await prisma.whatsappConfig.findFirst({
        where: { phoneNumberId: metadata.phone_number_id }
    });

    if (!config) return NextResponse.json({ status: 'error', message: 'Tenant no encontrado' });

    // 2. Identificar o Crear el Lead (basado en el wa_id del contacto)
    const lead = await prisma.lead.upsert({
        where: { waId: contactData.wa_id }, // Asegúrate de tener este campo en tu modelo Lead
        update: { name: contactData.profile?.name },
        create: {
            waId: contactData.wa_id,
            name: contactData.profile?.name || 'Usuario WhatsApp',
            tenantId: config.tenantId,
            phone: ""
        }
    });

    // 3. Identificar o Crear la Conversación
    const conversation = await prisma.conversation.upsert({
        where: { leadId: lead.id }, // Asumiendo que un lead tiene una conv activa
        update: { lastMessageAt: new Date(), isOpen: true },
        create: {
            tenantId: config.tenantId,
            leadId: lead.id
        }
    });

    // 4. Guardar el mensaje (con validación de duplicados vía metaMessageId)
    await prisma.message.upsert({
        where: { metaMessageId: messageData.id },
        update: {}, // Si ya existe, no hacemos nada
        create: {
            tenantId: config.tenantId,
            conversationId: conversation.id,
            messageText: messageData.text.body,
            metaMessageId: messageData.id,
            senderType: 'LEAD' // O lo que tengas en tu enum SenderType
        }
    });

    return NextResponse.json({ status: 'ok' });
}