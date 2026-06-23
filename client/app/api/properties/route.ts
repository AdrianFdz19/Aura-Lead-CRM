// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { propertyService } from '@/lib/propertyService';
import { createProperty } from '@/lib/propertyService';

export async function POST(req: Request) {
  // 1. Obtener la sesión de forma segura
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();

  // 2. Leer el cuerpo de la petición (solo los datos del formulario)
  const body = await req.json();
  
  // 3. Crear usando el tenantId que viene de la SESIÓN (no del cuerpo)
  try {
    const property = await propertyService.createProperty({
      ...body,
      tenantId: session.tenantId, // <--- Seguridad crítica aquí
    });
    
    return NextResponse.json(property);
  } catch (error) {
    console.error("Error al crear propiedad:", error);
    return NextResponse.json({ error: 'Error al procesar propiedad' }, { status: 500 });
    if (!data.tenantId) {
      return NextResponse.json({ error: 'tenantId es requerido' }, { status: 400 });
    }

    await createProperty(data);

    return NextResponse.json({ message: 'Propiedad creada e indexada' });
  } catch (error: any) {
    console.error('Error al crear propiedad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}