// lib/session.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

interface UserPayload {
  userId: string;
  tenantId: string;
  // ... cualquier otro dato que tengas en el payload del JWT
}

/**
 * Obtiene y verifica la sesión del usuario desde las cookies.
 * Diseñado para ser usado en API Routes y Server Components.
 * @returns El payload del usuario si el token es válido, de lo contrario null.
 */
export async function getSession(): Promise<UserPayload | null> {
  const token = cookies().get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
}
