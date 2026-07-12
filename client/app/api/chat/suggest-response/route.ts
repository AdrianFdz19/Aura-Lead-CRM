import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { propertyService } from "@/lib/propertyService";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {

        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId, senderType, messageText } = await req.json();

        if (!conversationId || !senderType || !messageText) {
            return NextResponse.json({ error: 'Faltan campos' }, { status: 401 });
        }

        //1.- Obtener mensajes previos de la base de datos
        const previousMessages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            take: 5, // Traer los ultimos 5 mensajes para el contexto 
        });

        // 1. Buscamos propiedades relevantes según el mensaje actual
        const tenantId = session.tenantId; // Asegúrate de tenerlo de la sesión
        const properties: any = await propertyService.searchProperties(tenantId, messageText);

        const context = properties.length > 0
            ? properties.map((p: any) => `- ${p.title}: ${p.description}. Precio: $${p.price}.`).join('\n')
            : "No se encontraron propiedades específicas para esta consulta.";

        type OpenAIRole = 'user' | 'assistant' | 'system';

        // 2. Mapeo para OpenAI (de tu senderType a roles de LLM)
        const formattedHistory: ChatCompletionMessageParam[] = previousMessages.map((msg) => ({
            role: msg.senderType === 'LEAD' ? 'user' : 'assistant',
            content: msg.messageText
        }));

        // 3. Llamada a OpenAI
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL as string,
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente inmobiliario virtual que trabaja para el agente.
                    Tu único objetivo es redactar respuestas para el cliente (LEAD).
                    - NUNCA escribas respuestas dirigidas al agente.
                    - SIEMPRE responde al cliente basándote en el historial de la conversación.
                    - Contexto de propiedades: ${context}
                    - Si el último mensaje en la conversación fue enviado por el agente, analiza qué esperaba el agente del lead y redacta la respuesta que el lead debería recibir o el seguimiento natural tras el mensaje del agente.`
                },
                ...formattedHistory,
                { role: "user", content: messageText }
            ],
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply }, { status: 200 });

    } catch (err) {
        console.error("Error en chat API:", err);
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
};