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
  /* console.log(body); */

  // 3. Crear usando el tenantId que viene de la SESIÓN (no del cuerpo)
  try {
    const property = await propertyService.createProperty({
      ...body,
      tenantId: session.tenantId, // <--- Seguridad crítica aquí
    });

    /* console.log(property); */
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
  const sortPrice = searchParams.get('sortPrice') || 'desc';
  // Puedes añadir más filtros aquí...

  try {
    const properties = await prisma.property.findMany({
      where: {
        tenantId: tenantId,
        // Filtros dinámicos
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        // Búsqueda por texto en múltiples campos
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [
        { price: sortPrice as 'asc' | 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Procesamos todas las imágenes de cada propiedad en paralelo
    const propertiesWithImages = await Promise.all(
      properties.map(async (p) => {
        const images = p.images && p.images.length > 0
          ? await Promise.all(p.images.map((imgKey) => getPublicUrl(imgKey)))
          : ['/placeholder.jpg'];

        return {
          ...p,
          images, // Reemplazamos o añadimos el arreglo completo con las URLs públicas firmadas
        };
      })
    );

    return NextResponse.json(propertiesWithImages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
