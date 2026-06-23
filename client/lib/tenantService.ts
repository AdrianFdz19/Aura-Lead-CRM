// lib/tenantService.ts
import { PrismaClient } from '@prisma/client';
import prisma from './prisma';

const tenantPrismaInstances: Record<string, PrismaClient> = {};

export async function getTenantPrisma(tenantId: string): Promise<PrismaClient> {
  if (tenantPrismaInstances[tenantId]) {
    return tenantPrismaInstances[tenantId];
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error('Tenant no encontrado');

  const tenantDbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${tenant.dbName}?schema=public`;
  
  tenantPrismaInstances[tenantId] = new PrismaClient({ datasources: { db: { url: tenantDbUrl } } });
  return tenantPrismaInstances[tenantId];
}
