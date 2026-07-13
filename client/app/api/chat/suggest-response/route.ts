import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { propertyService } from "@/lib/propertyService";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: any = [
    {
        type: "function",
        function: {
            name: "searchProperties",
            description: "Busca propiedades inmobiliarias en base a las preferencias, dudas o interés del lead.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "La consulta o tema de interés del lead (ej: 'casas con 3 habitaciones')" }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateLeadStatus",
            description: "Actualiza el estado de un lead en el CRM basándose en la intención detectada en la conversación.",
            parameters: {
                type: "object",
                properties: {
                    newStatus: {
                        type: "string",
                        enum: ["QUALIFIED", "VISIT", "NEGOTIATION"], // Tus estados definidos
                        description: "El nuevo estado al que debe pasar el lead."
                    },
                    reason: { type: "string", description: "Breve justificación de por qué el lead cambió de estado." }
                },
                required: ["newStatus", "reason"]
            }
        }
    }
];

interface Property {
    title: string;
    description: string;
    price: number;
    location: string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { conversationId, senderType, messageText } = await req.json();
        if (!conversationId || !senderType || !messageText) {
            return NextResponse.json({ error: 'Faltan campos' }, { status: 401 });
        }

        // 1. Obtener y ordenar historial
        const previousMessagesDesc = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        const formattedHistory: ChatCompletionMessageParam[] = previousMessagesDesc
            .reverse()
            .map((msg) => ({
                role: msg.senderType === 'LEAD' ? 'user' : 'assistant',
                content: msg.messageText
            }));

        // 2. Primera llamada: OpenAI decide si necesita usar la herramienta
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL as string,
            messages: [
                { role: "system", content: "Eres un asistente inmobiliario. Si el usuario pregunta por propiedades, usa searchProperties. Si no, responde directamente." },
                ...formattedHistory,
                { role: "user", content: messageText }
            ],
            tools: tools,
            tool_choice: "auto"
        });

        const responseMessage = response.choices[0].message;

        // 3. Si la IA decide llamar a la función
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];

            // VALIDACIÓN DE TIPO NECESARIA:
            if (toolCall.type === 'function') {
                const query = JSON.parse(toolCall.function.arguments).query;

                // Buscamos propiedades reales
                const properties: any = await propertyService.searchProperties(session.tenantId, query);
                const context = properties.length > 0
                    ? properties.map((p: any) => `- ${p.title}: ${p.description}. Precio: $${p.price}.`).join('\n')
                    : "No se encontraron propiedades.";

                // 4. Segunda llamada: Generar respuesta final
                const finalCompletion = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL as string,
                    messages: [
                        { role: "system", content: `Responde basado estrictamente en este contexto: ${context}` },
                        ...formattedHistory,
                        { role: "user", content: messageText },
                        responseMessage,
                        {
                            role: "tool",
                            tool_call_id: toolCall.id,
                            content: context
                        }
                    ]
                });

                return NextResponse.json({ reply: finalCompletion.choices[0].message.content });
            }
        }

        // Si no usó herramientas, devolvemos la respuesta directa
        return NextResponse.json({ reply: responseMessage.content });

    } catch (err) {
        console.error("Error en chat API:", err);
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}