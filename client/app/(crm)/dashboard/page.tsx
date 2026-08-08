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
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">

      {/* 1. MÉTRICAS SUPERIORES (KPI Cards) */}
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

      {/* 2. SECCIÓN PRINCIPAL: AI Assistant & Actividad Reciente (Cambiado por Inventario) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* AI Assistant */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <Bot className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="font-bold text-slate-900 mb-1 text-lg">AI Assistant</h2>
              <p className="text-sm text-slate-500 mb-6">Optimiza tu gestión de leads y automatiza respuestas con IA.</p>
            </div>
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              Nueva Acción
            </button>
          </div>
        </div>

        {/* Actividad Reciente / Leads (Sustituye a la tabla de inventario) */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900">Actividad Reciente</h2>
                <p className="text-xs text-slate-400">Últimas interacciones y movimientos en tus propiedades</p>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Filtrar actividad..."
                />
              </div>
            </div>

            {/* Contenido de actividad (Ejemplo visual limpio) */}
            <div className="p-6 divide-y divide-slate-100">
              <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Nuevo lead interesado en Departamento Centro</p>
                    <p className="text-xs text-slate-400">Hace 15 minutos</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
                  Lead
                </span>
              </div>

              <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    $
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Comisión actualizada en Residencia Lomas</p>
                    <p className="text-xs text-slate-400">Hace 2 horas</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-flex bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-3 py-1 rounded-full">
                  Finanzas
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <PropertyForm tenantId={session.tenantId} />
    </div>
  );
}
