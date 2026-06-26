// app/api/chat/route.ts
import { getSession } from "@/lib/auth";
import { propertyService } from "@/lib/propertyService";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Inicializamos OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const openAiModel = process.env.OPENAI_MODEL as string;

export async function POST(req: Request) {
    // 1. Obtener la sesión de forma segura
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { message, history } = await req.json();
        const tenantId = session.tenantId;
        const MAX_HISTORY: string = process.env.OPENAI_CHAT_MAX_HISTORY as string;

        // 1. Buscamos propiedades relevantes para el mensaje
        const properties: any = await propertyService.searchProperties(tenantId, message);

        // 2. Formateamos las propiedades como texto para el LLM
        const context = properties.length > 0
            ? properties.map((p: any) => `- ${p.title}: ${p.description}. Precio: $${p.price}. Ubicación: ${p.location}`).join('\n')
            : "No se encontraron propiedades que coincidan con la búsqueda.";

        const recentHistory = history.slice(-MAX_HISTORY, -1);

        // Mapeas el historial
        const formattedHistory = recentHistory.map((m: any) => ({
            role: m.role,
            content: m.content
        }));

        // 1. Llamada básica a OpenAI
        const completion = await openai.chat.completions.create({
            model: openAiModel, // O gpt-3.5-turbo
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente inmobiliario. Usa estrictamente el siguiente contexto de propiedades para responder: \n${context}. Si la información no está en el contexto, indica amablemente que no tienes detalles sobre eso, pero nunca inventes datos.`
                },
                ...formattedHistory,
                { role: "user", content: message }
            ],
        });

        const reply = completion.choices[0].message.content;

        // 2. Devolvemos la respuesta
        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Error en chat API:", error);
        return NextResponse.json({ error: "Error procesando el mensaje" }, { status: 500 });
    }
}