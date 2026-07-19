import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { propertyService } from '@/lib/propertyService';
import prisma from '@/lib/prisma';
import { getPublicUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
  // 1. Obtener la sesión de forma segura
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Leer el cuerpo de la petición (solo los datos del formulario)
  const body = await req.json();
  console.log(body);

  // 3. Crear usando el tenantId que viene de la SESIÓN (no del cuerpo)
  try {
    const property = await propertyService.createProperty({
      ...body,
      tenantId: session.tenantId, // <--- Seguridad crítica aquí
    });

    console.log(property);
    return NextResponse.json(property);
  } catch (error: any) {
    console.error("ERROR DETALLADO:", error.message);
    console.error("STACK:", error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Search and filter properties
export async function GET(request: Request) {
  // 1. Obtener la sesión de forma segura
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);

  const tenantId = session.tenantId;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  // Puedes añadir más filtros aquí...

  try {
    const properties = await prisma.property.findMany({
      where: {
        tenantId: tenantId,
        // Filtros dinámicos
        ...(status && { status: status as any }),
        ...(type && { type: type }),
        // Búsqueda por texto en múltiples campos
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Procesamos las URLs en el SERVIDOR
    const propertiesWithImages = await Promise.all(
      properties.map(async (p) => ({
        ...p,
        imageUrl: p.images && p.images.length > 0
          ? await getPublicUrl(p.images[0])
          : '/placeholder.jpg'
      }))
    );

    return NextResponse.json(propertiesWithImages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
