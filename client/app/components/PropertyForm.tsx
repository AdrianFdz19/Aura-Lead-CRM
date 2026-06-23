// components/PropertyForm.tsx 

'use client';
import { useState, useTransition } from 'react';

export default function PropertyForm({ tenantId }: { tenantId: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await fetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          tenantId,
          title: formData.get('title'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          location: formData.get('location'),
        }),
      });

      if (res.ok) alert('Propiedad creada e indexada para IA');
    });
  }

  return (
    <form action={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border space-y-4">
      <input name="title" placeholder="Título de la propiedad" className="w-full p-2 border rounded" required />
      <textarea name="description" placeholder="Descripción detallada..." className="w-full p-2 border rounded" required />
      <input name="price" type="number" placeholder="Precio" className="w-full p-2 border rounded" required />
      <input name="location" placeholder="Ubicación" className="w-full p-2 border rounded" required />
      
      <button 
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isPending ? 'Indexando con IA...' : 'Guardar Propiedad'}
      </button>
    </form>
  );
}