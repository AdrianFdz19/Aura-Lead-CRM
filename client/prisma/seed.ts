import { PrismaClient, Prisma, Role, PropertyStatus, PropertyType } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";
import bcrypt from 'bcryptjs';

// 1.- Configuración del adaptador
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando siembra de datos (Seed) para Inmobiliaria Elite...");

  // 2. Crear o actualizar el Tenant Demo
  const tenantSlug = "inmobiliaria-elite";
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: { name: "Inmobiliaria Elite" },
    create: {
      name: "Inmobiliaria Elite",
      slug: tenantSlug,
      isActive: true,
    },
  });

  console.log(`✅ Tenant asegurado: ${tenant.name} (${tenant.id})`);

  // 3. Generar hash seguro para los usuarios de prueba
  const adminPasswordHash = await bcrypt.hash('admin1234', 10);
  const brokerPasswordHash = await bcrypt.hash('broker1234', 10);

  // 4. Crear o actualizar Usuarios del Tenant
  const users = [
    {
      email: "admin@elite.com",
      name: "Admin Principal",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    {
      email: "juan@elite.com",
      name: "Juan Broker",
      passwordHash: brokerPasswordHash,
      role: Role.AGENT,
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        tenantId: tenant.id,
      },
      create: {
        tenantId: tenant.id,
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role,
        isActive: true,
      },
    });
  }
  console.log("✅ Usuarios de prueba creados/actualizados.");

  // 5. Crear Propiedades de Prueba (Alineadas con el modelo Property y la tabla vectorial)
  const sampleProperties = [
    {
      title: "Casa en Lomas de Angelópolis",
      description: "Moderna residencia de 3 recámaras, acabados de lujo, alberca climatizada y seguridad 24/7.",
      price: new Prisma.Decimal(5500000.00),
      location: "Puebla / Lomas de Angelópolis",
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      images: ["properties/e04d226c-9aae-4b39-b644-c7fbc2d417ff-1784588568568"],
    },
    {
      title: "Departamento Céntrico de Lujo",
      description: "Espectacular departamento amueblado con vista panorámica, 2 recámaras y amenidades exclusivas.",
      price: new Prisma.Decimal(2800000.00),
      location: "Centro, Xalapa, Ver.",
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      images: ["properties/1d29082a-207e-4b7a-86b4-548347bb1ae9-1784674342114"],
    },
  ];

  // Limpiamos o insertamos propiedades de ejemplo para la demo
  for (const prop of sampleProperties) {
    await prisma.property.create({
      data: {
        tenantId: tenant.id,
        ...prop,
      },
    });
  }

  console.log("✅ Propiedades de prueba insertadas exitosamente.");
  console.log("🚀 ¡Seed completado con éxito mediante el adaptador de PG!");

}

main()
    .catch((e) => {
        console.error("❌ Error durante el seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });