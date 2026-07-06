import PropertyForm from "@/app/components/PropertyForm";
import { Bot, Search, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getSession } from "@/lib/auth";
import { getPropertiesByTenant } from "@/lib/propertyService";
import { getPublicUrl } from "@/lib/s3";

// Mock de propiedades
const properties = [
  { id: 1, name: 'Vila Toscana', location: 'Rosewood Street', type: 'Residential', status: 'Available', price: '$5,000/mo', leads: 5, commission: '$2,500' },
  { id: 2, name: 'Sunset Heights', location: 'Brooklyn, NY', type: 'Commercial', status: 'Occupied', price: '$12,000/mo', leads: 2, commission: '$6,000' },
];

export default async function Dashboard() {
  const session = await getSession();

  // Asegúrate de que exista la sesión antes de renderizar
  if (!session) return null;

  // Obtenemos los datos reales
  const properties = await getPropertiesByTenant(session.tenantId);
  console.log(properties);

  // Opcional: Generar URLs firmadas para las imágenes
  const propertiesWithImages = await Promise.all(properties.map(async (p) => ({
    ...p,
    imageUrl: p.images.length > 0 ? await getPublicUrl(p.images[0]) : null
  })));

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">

      {/* 1. MÉTRICAS SUPERIORES (KPI Cards Estilo Premium CRM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Propiedades Activas',
            value: properties.length.toString(),
            icon: <Briefcase className="w-5 h-5 text-blue-600" />,
            bg: 'border-blue-100 bg-blue-50/50',
            border: 'border-l-blue-500'
          },
          {
            label: 'Solicitudes Pendientes',
            value: '45',
            icon: <Users className="w-5 h-5 text-purple-600" />,
            bg: 'border-purple-100 bg-purple-50/50',
            border: 'border-l-purple-500'
          },
          {
            label: 'Tasa de Ocupación',
            value: '92%',
            icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
            bg: 'border-amber-100 bg-amber-50/50',
            border: 'border-l-amber-500'
          },
          {
            label: 'Comisión Estimada',
            value: '$128,450',
            icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
            bg: 'border-emerald-100 bg-emerald-50/50',
            border: 'border-l-emerald-500'
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-4 border border-slate-200 bg-white rounded-xl shadow-sm flex items-center justify-between border-l-4 ${stat.border} hover:shadow-md transition-shadow`}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">
                {stat.value}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>


      {/* 2. AI Assistant & Tabla */}
      <div className="grid grid-cols-12 gap-8">
        {/* IA Assistant (Estilo Tarjeta Elevada) */}
        <div className="col-span-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <Bot className="w-8 h-8 text-blue-600 mb-4" />
            <h2 className="font-bold text-slate-900 mb-1">AI Assistant</h2>
            <p className="text-sm text-slate-500 mb-6">Optimiza tu gestión de leads con IA.</p>
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Nueva Acción
            </button>
          </div>
        </div>

        {/* Inventario (Tabla Moderna) */}
        <div className="col-span-9">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-900">Inventario</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <input
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64"
                  placeholder="Buscar..."
                />
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 text-left">Propiedad</th>
                  <th className="px-6 py-4 text-left">Estatus</th>
                  <th className="px-6 py-4 text-left">Precio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {propertiesWithImages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={p.imageUrl || '/placeholder.jpg'} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{p.title}</p>
                        <p className="text-slate-400 text-xs">{p.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
                        Activa
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">${p.price.toString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        IA Actions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PropertyForm tenantId={session.tenantId} />
    </div>
  );
}
