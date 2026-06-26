// lib/propertyService.ts

import prisma from './prisma'
import { generateEmbedding } from './ai'; // La función que creamos antes

export const propertyService = {
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
  }
};