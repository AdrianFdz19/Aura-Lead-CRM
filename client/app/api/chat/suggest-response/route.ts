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
        const previousMessagesDesc = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: 5, // Traer los ultimos 5 mensajes para el contexto 
        });

        // 2. REVERTIR el array para que queden en orden cronológico (ascendente)
        const previousMessages = previousMessagesDesc.reverse();

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

        console.log(formattedHistory);

        const systemPrompt = `
            Eres un asistente inmobiliario virtual.
            Tu tarea es redactar la respuesta que el LEAD (cliente) debe recibir.
            - EL AGENTE es quien gestiona la conversación.
            - SI EL ÚLTIMO MENSAJE FUE ENVIADO POR EL AGENTE: Analiza la intención del agente y redacta la respuesta que el LEAD debería recibir a continuación o el seguimiento natural.
            - SI EL ÚLTIMO MENSAJE FUE ENVIADO POR EL LEAD: Responde directamente al lead.
            NUNCA redactes respuestas dirigidas al agente.
        `;

        // 3. Llamada a OpenAI
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL as string,
            messages: [
                {
                    role: "system",
                    content: `${systemPrompt}
            
                    INFORMACIÓN DE PROPIEDADES DISPONIBLES:
                    ${context}
                    
                    Usa esta información estrictamente para responder a las consultas del lead. 
                    Si la información no está aquí, no inventes datos.`
                },
                ...formattedHistory
            ],
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply }, { status: 200 });

    } catch (err) {
        console.error("Error en chat API:", err);
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
};