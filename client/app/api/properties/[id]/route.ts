import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getPublicUrl } from "@/lib/s3";
import { getSession } from '@/lib/auth';
import { Images } from 'lucide-react';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Hacemos await de params antes de desestructurar el id
  const { id } = await params;
  const tenantId = session.tenantId;

  try {
    const property = await prisma.property.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // 1. Guardamos las claves originales
    const imageKeys = property.images || [];

    // 2. Resolvemos todas las URLs de forma paralela si el arreglo existe y tiene elementos
    const images = property.images && property.images.length > 0
      ? await Promise.all(
        property.images.map(async (img: string) => {
          return await getPublicUrl(img);
        })
      )
      : []; // Devolvemos un array vacío si no hay imágenes

    // 3. Construimos el objeto final, incluyendo tanto las URLs firmadas como las claves originales
    const propertyWithImages = {
      ...property,
      images,
      imageKeys, // <-- SOLUCIÓN: Añadimos las claves al objeto de respuesta
    };

    return NextResponse.json(propertyWithImages);

  } catch (error) {
    console.error("Error fetching property detail API:", error);
    return NextResponse.json({ error: 'Failed to fetch property details' }, { status: 500 });
  }
}

// Edit a property

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const tenantId = session.tenantId;

  // 1. Extraemos los campos del body (incluyendo 'images') usando request.json()
  const body = await request.json();
  const {
    title,
    description,
    price,
    location,
    status,
    commission,
    type,
    images // <--- Recibimos el arreglo consolidado desde el cliente
  } = body;

  console.log(body);

  try {
    // 2. Verificamos que la propiedad exista y pertenezca al tenant actual
    const property = await prisma.property.findFirst({
      where: {
        id: id,
        tenantId: tenantId
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // 3. Actualizamos la propiedad en Prisma incluyendo el arreglo de imágenes
    const propertyUpdated = await prisma.property.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        location,
        status,
        commission: commission ? parseFloat(commission) : undefined,
        type,
        images: images !== undefined ? images : undefined, // Actualizamos las S3 keys si vienen en el request
      },
    });

    // 4. Procesamos todas las imágenes con S3 igual que en el GET para enviarlas listas al cliente
    const processedImages = propertyUpdated.images && propertyUpdated.images.length > 0
      ? await Promise.all(propertyUpdated.images.map((imgKey: string) => getPublicUrl(imgKey)))
      : [];

    // Guardamos las claves originales para devolverlas también
    const updatedImageKeys = propertyUpdated.images || [];

    const propertyWithImages = {
      ...propertyUpdated,
      images: processedImages, // Devolvemos el array con las URLs públicas firmadas
      imageKeys: updatedImageKeys, // <-- SOLUCIÓN: Añadimos las claves también en la respuesta de actualización
    };

    return NextResponse.json(propertyWithImages, { status: 200 });

  } catch (error) {
    console.error("Error updating property detail API:", error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}