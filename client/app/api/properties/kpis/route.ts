import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = session.tenantId;

  try {
    // 1. Propiedades Activas (status === 'AVAILABLE')
    const activeProperties = await prisma.property.count({
      where: { tenantId, status: 'AVAILABLE' }
    });

    // 2. Pending Requests (Suma total de leads acumulados en las propiedades del tenant)
    const pendingRequestsAgg = await prisma.property.aggregate({
      where: { tenantId },
      _sum: { leads: true }
    });
    const pendingRequests = pendingRequestsAgg._sum.leads || 0;

    // 3. Tasa de Ocupación (Propiedades ocupadas / Total de propiedades)
    const totalProperties = await prisma.property.count({
      where: { tenantId }
    });

    const occupiedProperties = await prisma.property.count({
      where: { tenantId, status: 'OCCUPIED' }
    });

    const occupancyRate = totalProperties > 0 
      ? Math.round((occupiedProperties / totalProperties) * 100) 
      : 0;

    // 4. Estimated Commission (Suma de la comisión de las propiedades activas o totales)
    const commissionAgg = await prisma.property.aggregate({
      where: { tenantId, status: 'AVAILABLE' },
      _sum: { commission: true }
    });
    const estimatedCommission = commissionAgg._sum.commission || 0;

    return NextResponse.json({
      activeProperties,
      pendingRequests,
      occupancyRate,
      estimatedCommission
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}