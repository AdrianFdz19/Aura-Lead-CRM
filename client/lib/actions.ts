// En tu server action (ej. src/lib/actions.ts)
'use server'

import { getSession } from './auth'; // Correcto: Importando desde lib/auth.ts
import prisma from './prisma';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { PLAN_IDS } from './stripe-plans';
import { Subscription } from '@/app/generated/prisma/browser';
import { cookies } from 'next/headers';

export async function getSubscriptionStatus(): Promise<Subscription | null> {
  const session = await getSession(); // Obtiene el payload del JWT
  if (!session) return null;

  // Busca en la base de datos el plan real
  return await prisma.subscription.findUnique({
    where: { tenantId: session.tenantId as string },
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error: Usando una versión de API anterior a la esperada por la librería
  apiVersion: '2025-01-27.acacia',
});

export async function createCheckoutSession(plan: 'basic' | 'professional' | 'enterprise') {
  const priceId = PLAN_IDS[plan];
  const session = await getSession();
  if (!session) redirect('/login');

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      tenantId: session.tenantId, // Clave para identificar al cliente al volver
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/verify-payment`, // Redirige a una página que refresca el JWT
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
  });

  if (checkoutSession.url) {
    redirect(checkoutSession.url);
  }
}

export async function logout() {
  // 1. Eliminamos la cookie de sesión
  (await cookies()).delete('session');

  // 2. Redirigimos al login
  redirect('/login');
}