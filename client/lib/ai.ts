// lib/ai.ts
import OpenAI from 'openai';
import { decrypt } from '@/lib/encryption'; // Tu función de descifrado
import prisma from './prisma';

export async function generateEmbedding(text: string, tenantId: string): Promise<number[]> {
    // Limpiamos el texto para mejorar la calidad del embedding
    const cleanedText = text.replace(/\n/g, ' ');

    // 1. Buscamos la configuración del tenant
    const config = await prisma.tenantLlmConfig.findUnique({
        where: { tenantId },
    });

    const apiKey = config?.apiKeyEncrypted
        ? decrypt(config.apiKeyEncrypted) : null

    const openai = new OpenAI({ apiKey: apiKey });

    const response = await openai.embeddings.create({
        model: "text-embedding-3-small", // El más eficiente y barato para RAG
        input: cleanedText,
    });

    return response.data[0].embedding;
}

export async function getOpenAIClient(tenantId: string) {
    // 1. Buscamos la configuración del tenant
    const config = await prisma.tenantLlmConfig.findUnique({
        where: { tenantId },
    });

    // 2. Determinamos qué key usar
    // Si tiene configuración propia, usamos esa; si no, caemos al .env
    const apiKey = config?.apiKeyEncrypted
        ? decrypt(config.apiKeyEncrypted) : null

    // 3. Retornamos la instancia configurada
    return {
        client: new OpenAI({ apiKey }),
        model: config?.modelName || 'gpt-4o-mini'
    };
}
