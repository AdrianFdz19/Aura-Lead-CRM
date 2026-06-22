// components/whatsapp-guard.tsx
'use client';

import { useWhatsAppConfig } from '../hooks/use-whatsapp-config';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function WhatsAppGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useWhatsAppConfig();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si ya está cargando o ya estamos en la página de configuración, no hacemos nada
    if (isLoading || pathname === '/settings/whatsapp') return;

    // Si la config no existe, redirigimos
    if (data && !data.isConfigured) {
      router.push('/settings/whatsapp');
    }
  }, [data, isLoading, pathname, router]);

  if (isLoading) return <div>Cargando...</div>; // O un esqueleto de carga

  return <>{children}</>;
}