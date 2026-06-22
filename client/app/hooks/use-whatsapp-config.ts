// hooks/use-whatsapp-config.ts

import { useQuery } from '@tanstack/react-query';

export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ['whatsapp-config'],
    queryFn: async () => {
      const res = await fetch('/api/whatsapp/status');
      return res.json();
    }
  });
}