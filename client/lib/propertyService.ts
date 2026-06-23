// lib/propertyService.ts
  
import prisma from './prisma'; // Tu instancia singleton
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

    console.log("¿Prisma está definido?", prisma);

    // 2. Guardamos en la base de datos
    return await prisma.property.create({
      data: {
        ...data,
        embedding: embedding as any,
      },
    });
  }
};