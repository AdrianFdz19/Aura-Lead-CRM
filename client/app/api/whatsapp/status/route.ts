// app/api/whatsapp/status/route.ts

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server'; 

export async function GET() {
  const session = await getSession(); // Tu lógica de sesión

    if (!session) {
      return NextResponse.json({ isConfigured: false, data: null });
    }
  
  const config = await prisma.whatsappConfig.findUnique({
    where: { tenantId: session.tenantId },
    select: { id: true, phoneNumberId: true } // Solo traemos lo mínimo
  });

  return NextResponse.json({ isConfigured: !!config, data: config });
}