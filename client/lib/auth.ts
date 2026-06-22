// src/lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export interface UserSession {
  user: any;
  userId: string;
  tenantId: string;
  /* status: string; */
}

export async function getSession(): Promise<UserSession | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserSession; // Aquí tienes tu userId, tenantId y status
  } catch {
    return null;
  }
}

export async function refreshSession(newStatus: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return;

  try {
    // 1. Decodificar el token actual para obtener los datos existentes
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // 2. Crear un NUEVO token con el status actualizado
    // Usamos el spread (...) para mantener userId y tenantId intactos
    const newToken = await new SignJWT({ 
      ...payload, 
      status: newStatus 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // 3. Sobrescribir la cookie con el nuevo token
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