import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: session.tenantId },
    select: { status: true }
  });

  return NextResponse.json({ status: subscription?.status });
}