// lib/propertyService.ts

import prisma from './prisma'
import { generateEmbedding } from './ai'; // La función que creamos antes

export const propertyService = {
  // Create Property Function
  async createProperty(data: {
    tenantId: string;
    title: string;
    description: string;
    price: number;
    location: string;
  }) {
    // 1. Generamos el vector antes de guardar
    const embedding = await generateEmbedding(
      `${data.title} - ${data.description} - ${data.location}`
    );

    // 2. Guardamos en la base de datos
    return await prisma.$executeRaw`
      INSERT INTO "Property" ("id", "title", "description", "price", "location", "tenant_id", "embedding")
      VALUES (gen_random_uuid(), ${data.title}, ${data.description}, ${data.price}::decimal, ${data.location}, ${data.tenantId}::uuid, ${`[${embedding.join(',')}]`}::vector)
    `;
  },

  // Search Property Function
  async searchProperties(tenantId: string, queryText: string) {
    // 1. Generamos el embedding de la pregunta del usuario
    const queryEmbedding = await generateEmbedding(queryText);

    // 2. Convertimos el array a string para que Postgres lo entienda
    const vectorQuery = `[${queryEmbedding.join(',')}]`;

    // 3. Ejecutamos la búsqueda semántica con pgvector
    // Usamos <-> para distancia euclidiana o <=> para similitud de coseno
    // <-> suele ser más preciso para embeddings de OpenAI
    const results = await prisma.$queryRaw`
      SELECT id, title, description, price, location, 
             (embedding <-> ${vectorQuery}::vector) as distance
      FROM "Property"
      WHERE "tenant_id" = ${tenantId}::uuid
      ORDER BY distance ASC
      LIMIT 3;
    `;

    return results;
  }
};



