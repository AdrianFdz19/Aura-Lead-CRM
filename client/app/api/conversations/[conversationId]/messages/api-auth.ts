import { getSession, UserSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { [key: string]: string | string[] | undefined } };

type AuthenticatedApiHandler = (
  req: NextRequest,
  context: RouteParams & { session: UserSession }
) => Promise<NextResponse> | NextResponse;

/**
 * Una función de orden superior (HOF) que envuelve un manejador de API Route
 * para asegurar que el usuario esté autenticado.
 *
 * @param handler El manejador de la ruta que se ejecutará si la autenticación es exitosa.
 * @returns Un nuevo manejador de ruta que primero valida la sesión.
 */
export function withAuth(handler: AuthenticatedApiHandler) {
  return async (req: NextRequest, context: RouteParams): Promise<NextResponse> => {
    const session = await getSession();

    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return handler(req, { ...context, session });
  };
}