// app/checkout/verify-payment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verificando tu pago...');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10; // Intentaremos durante 20 segundos aprox

    async function checkStatus() {
      try {
        // Consultamos un endpoint que valide la base de datos
        // Usamos una API route propia porque es más fácil manejar errores ahí
        const res = await fetch('/api/subscription/check-status');
        const data = await res.json();

        if (data.status === 'active') {
          setStatus('¡Pago confirmado! Redirigiendo...');
          router.push('/dashboard');
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2000); // Polling cada 2 segundos
          } else {
            setStatus('El proceso está tardando más de lo esperado.');
            // Damos la opción de ir al dashboard manualmente si falla el polling
            setTimeout(() => router.push('/dashboard'), 3000);
          }
        }
      } catch (error) {
        console.error('Error verificando:', error);
      }
    }

    checkStatus();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <h2 className="mt-4 text-xl font-semibold">{status}</h2>
      <p className="text-gray-500">No cierres esta ventana.</p>
    </div>
  );
}