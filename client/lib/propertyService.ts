// lib/propertyService.ts

import prisma from './prisma'
import { generateEmbedding } from './ai'; // La función que creamos antes

export const getPropertiesByTenant = async (tenantId: string) => {
  return await prisma.property.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
};  

export const propertyService = {
  // Create Property Function
  async createProperty(data: {
    tenantId: string;
    title: string;
    description: string;
    type: string;
    price: number;
    location: string;
    images: string[];
    status?: 'AVAILABLE' | 'OCCUPIED' | 'PENDING'; // Opcional
    commission?: number; // Opcional
  }) {
    // 1. Generamos el vector antes de guardar
    const embedding = await generateEmbedding(
      `${data.title} - ${data.description} - ${data.location}`
    );

    // 2. Guardamos en la base de datos
    return await prisma.$executeRaw`
    INSERT INTO "properties" 
    ("id", "title", "description", "price", "type", "location", "tenant_id", "images", "embedding", "status", "commission", "leads")
    VALUES (
      gen_random_uuid(), 
      ${data.title}, 
      ${data.description}, 
      ${data.price}::decimal, 
      ${data.type}, 
      ${data.location}, 
      ${data.tenantId}::uuid, 
      ${data.images}, 
      ${`[${embedding.join(',')}]`}::vector,
      ${data.status || 'AVAILABLE'}::"PropertyStatus",
      ${data.commission || 0}::decimal,
      0
    )
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
      FROM "properties"
      WHERE "tenant_id" = ${tenantId}::uuid
      ORDER BY distance ASC
      LIMIT 3;
    `;

    return results;
  }
};



