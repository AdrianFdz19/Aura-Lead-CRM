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
          type: formData.get('type'),
          price: parseFloat(formData.get('price') as string),
          location: formData.get('location'),
          status: formData.get('status'),
          commission: parseFloat(formData.get('commission') as string || '0'),
          images: imageUrls,
        }),
      });
      alert('Property created successfully');
    });
  }

  return (
    <form action={handleSubmit} className="p-8 bg-white rounded-lg space-y-6 h-full flex flex-col">
      <div className="flex-none">
        <h2 className="text-xl font-bold text-slate-800">Register New Property</h2>
        <p className="text-sm text-slate-500 mt-1">Fill in the details to add a new property to the inventory.</p>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <input name="title" placeholder="Property Title (e.g., Modern Apartment in Downtown)" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400" required />

        <textarea name="description" placeholder="Detailed description..." className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg h-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400" required />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="type" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800">
            <option value="HOUSE">Select Type</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="LAND">Land</option>
          </select>
          <select name="status" defaultValue="AVAILABLE" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800">
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="price" type="number" placeholder="Price ($)" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400" required />
          <input name="commission" type="number" placeholder="Commission ($)" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400" />
        </div>

        <input name="location" placeholder="Location / Address" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400" required />

        <div className="border-2 border-dashed border-slate-200 p-6 rounded-lg text-center hover:border-indigo-400 transition-colors">
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <p className="text-xs text-slate-400 mt-2">Upload high-quality photos</p>
        </div>
      </div>

      <button 
        disabled={isPending}
        className="w-full flex-none bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {isPending ? 'Indexing with AI...' : 'Save Property'}
      </button>
    </form>
  );
}