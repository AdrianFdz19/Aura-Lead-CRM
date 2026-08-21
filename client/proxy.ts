import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Si NO hay token, proteger todas las rutas privadas de la app
  if (!token) {
    // Si intenta entrar a la raíz '/', lo mandamos al login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/auth/refresh')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 2. Si SÍ hay token, verificar la autenticidad e integridad del JWT
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    // Si un usuario autenticado entra a la raíz '/', lo mandamos directo a /dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si ya está autenticado e intenta forzar la entrada a login o registro:
    if (pathname === '/login' || pathname === '/register') {
      // Lo mandamos siempre a /dashboard.
      // El layout de (crm) decidirá en tiempo real con Prisma si se queda ahí o va a /checkout.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Si el token fue manipulado, es inválido o expiró: limpiamos la cookie dañada y mandamos a login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  // Las rutas que el middleware debe interceptar obligatoriamente
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/.*|api/webhooks/.*).*)',
  ],
};
