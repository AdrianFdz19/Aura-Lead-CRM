'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Algo salió mal en el servidor</h2>
          <p>{error?.message || 'Error inesperado'}</p>
          <button
            onClick={() => reset()}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}