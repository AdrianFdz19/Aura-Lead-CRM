import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { propertyService } from '@/lib/propertyService';

export async function POST(req: Request) {
  // 1. Obtener la sesión de forma segura
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Leer el cuerpo de la petición (solo los datos del formulario)
  const body = await req.json();

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