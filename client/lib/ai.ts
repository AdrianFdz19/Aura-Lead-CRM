// lib/ai.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  // Limpiamos el texto para mejorar la calidad del embedding
  const cleanedText = text.replace(/\n/g, ' ');

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // El más eficiente y barato para RAG
    input: cleanedText,
  });

  return response.data[0].embedding;
}