import { getSession } from "@/lib/auth";
import AddProperty from '@/app/components/AddProperty';
import InventoryClient from '@/app/components/InventoryTable';

export default async function Dashboard() {
  const session = await getSession();

  // Asegúrate de que exista la sesión antes de renderizar
  if (!session) return null;

  return (
    <div className="w-full h-full bg-slate-50 p-4 md:p-6 space-y-6 mb-24">  
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Property Inventory</h1>
      </div>

      {/* 2. Inventario (Tabla Moderna) - Ahora ocupa todo el ancho */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-slate-900">Your Inventory</h2>
            <p className="text-sm text-slate-500 mt-1">Manage all your properties in one place.</p>
          </div>
          <div className="flex items-center">
            {/* El nuevo componente para añadir propiedades */}
            <AddProperty tenantId={session.tenantId} />
          </div>
        </div>

        <InventoryClient tenantId={session.tenantId} />
      </div>
    </div>
  );
}
