// components/PropertyForm.tsx 

'use client';
import { useState, useTransition } from 'react';

export default function PropertyForm({ tenantId }: { tenantId: string }) {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const imageUrls = [];
      for (const file of files) {
        const { uploadUrl, fileKey } = await fetch('/api/upload-url', {
          method: 'POST',
          body: JSON.stringify({ fileType: file.type }),
        }).then(r => r.json());

        await fetch(uploadUrl, { method: 'PUT', body: file });
        imageUrls.push(fileKey);
      }

      await fetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          tenantId,
          title: formData.get('title'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          location: formData.get('location'),
          status: formData.get('status'),
          commission: parseFloat(formData.get('commission') as string || '0'),
          images: imageUrls,
        }),
      });
      alert('Propiedad creada con éxito');
    });
  }

  return (
    <form action={handleSubmit} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-lg space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800">Registrar Nueva Propiedad</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <input name="title" placeholder="Título" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 placeholder:text-gray-400" required />
        <select name="status" className="w-full p-3 border rounded-xl outline-none text-gray-800">
          <option value="AVAILABLE">Disponible</option>
          <option value="OCCUPIED">Ocupado</option>
          <option value="PENDING">Pendiente</option>
        </select>
      </div>

      <textarea name="description" placeholder="Descripción detallada..." className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 placeholder:text-gray-400" required />
      
      <div className="grid grid-cols-2 gap-4">
        <input name="price" type="number" placeholder="Precio" className="w-full p-3 border rounded-xl text-gray-800 placeholder:text-gray-400" required />
        <input name="commission" type="number" placeholder="Comisión" className="w-full p-3 border rounded-xl text-gray-800 placeholder:text-gray-400" />
      </div>

      <input name="location" placeholder="Ubicación" className="w-full p-3 border rounded-xl text-gray-800 placeholder:text-gray-400" required />

      <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center hover:border-indigo-400 transition-colors">
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
        <p className="text-xs text-gray-400 mt-2">Sube fotos de alta calidad</p>
      </div>

      <button 
        disabled={isPending}
        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:bg-gray-300"
      >
        {isPending ? 'Indexando con IA...' : 'Guardar Propiedad'}
      </button>
    </form>
  );
}