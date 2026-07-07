// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export interface UserSession {
  userId: string;
  tenantId: string;
  status: string; // 'active', 'pending_payment', etc.
  // ... cualquier otro dato que tengas en el payload del JWT
  /* status: string; */
}

/**
 * Obtiene y verifica la sesión del usuario desde las cookies.
 * **Esta es una función de solo servidor.**
 * Diseñada para ser usada en API Routes, Server Actions y Server Components.
 * @returns El payload del usuario si el token es válido, de lo contrario null.
 * @throws Si se intenta usar en un Client Component.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies(); // Asegúrate de await
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    // IMPORTANTE: Asegúrate de mapear solo lo que necesitas
    return {
      userId: payload.userId as string,
      tenantId: payload.tenantId as string,
      status: payload.status as string,
    } as UserSession;
    
  } catch (e) {
    console.error("Error verificando sesión:", e);
    return null;
  }
}

export async function refreshSession(newStatus: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    // Creamos un nuevo objeto limpiando los campos internos del JWT
    const newPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      status: newStatus,
    };

    const newToken = await new SignJWT(newPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    cookieStore.set('session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
  } catch (error) {
    console.error("Error al refrescar la sesión:", error);
  }
}