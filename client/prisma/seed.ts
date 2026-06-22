import { PrismaClient, Prisma } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

// Configuración del adaptador
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Definimos los datos iniciales usando los tipos generados
  const tenantData: Prisma.TenantCreateInput = {
    name: "Inmobiliaria Elite",
    slug: "inmobiliaria-elite",
  };

  // 2. Creamos el Tenant
  const tenant = await prisma.tenant.create({ data: tenantData });

  // 3. Definimos usuarios
  const userData: Prisma.UserCreateInput[] = [
    {
      tenant: { connect: { id: tenant.id } },
      name: "Admin Principal",
      email: "admin@elite.com",
      passwordHash: "hash_seguro_admin",
      role: 'ADMIN',
    },
    {
      tenant: { connect: { id: tenant.id } },
      name: "Juan Broker",
      email: "juan@elite.com",
      passwordHash: "hash_seguro_broker",
      role: 'AGENT',
    },
  ];

  for (const u of userData) {
    await prisma.user.create({ data: u });
  }

  // 4. Creamos una propiedad y un lead
  const property = await prisma.product.create({
    data: {
      tenant: { connect: { id: tenant.id } },
      title: "Casa en Lomas de Angelópolis",
      price: 5500000.00,
      status: "disponible",
      mediaUrls: ["https://s3.aws.com/casa1.jpg"],
    },
  });

  console.log("Seed completado con adaptador PG.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });