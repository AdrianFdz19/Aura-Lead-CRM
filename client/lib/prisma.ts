// lib/prisma.ts

import { PrismaClient } from "../app/generated/prisma/client"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
const globalForPrisma = global as unknown as {
  prisma: PrismaClient; 
}; 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
  }); 

console.log("Modelos en el cliente:", Object.keys(prisma).filter(k => !k.startsWith('_')));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 

export default prisma; 