'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Se crea una única instancia del QueryClient a nivel de módulo (fuera de la función)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto por defecto
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  // 2. Ya no usamos useState, simplemente pasamos la instancia existente
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}