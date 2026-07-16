import { Search, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getSession } from "@/lib/auth";
import { getPropertiesByTenant } from "@/lib/propertyService";
import { getPublicUrl } from "@/lib/s3";
import AddProperty from '@/app/components/AddProperty';

export default async function Dashboard() {
  const session = await getSession();

  // Asegúrate de que exista la sesión antes de renderizar
  if (!session) return null;

  // Obtenemos los datos reales
  const properties = await getPropertiesByTenant(session.tenantId);

  // Opcional: Generar URLs firmadas para las imágenes
  const propertiesWithImages = await Promise.all(properties.map(async (p) => ({
    ...p,
    imageUrl: p.images.length > 0 ? await getPublicUrl(p.images[0]) : null
  })));

  return (
    <div className="w-full h-full bg-slate-50 p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Inventario de Propiedades</h1>
      </div>

      {/* 1. MÉTRICAS SUPERIORES (KPI Cards Estilo Premium CRM) */}
      {/* Estas tarjetas son un buen resumen, las mantenemos */}
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

      {/* 2. Inventario (Tabla Moderna) - Ahora ocupa todo el ancho */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-slate-900">Tu Inventario</h2>
            <p className="text-sm text-slate-500 mt-1">Gestiona todas tus propiedades en un solo lugar.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64"
                placeholder="Buscar por nombre o ubicación..."
              />
            </div>
            {/* El nuevo componente para añadir propiedades */}
            <AddProperty tenantId={session.tenantId} />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-slate-400 uppercase text-[10px] tracking-widest font-bold bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left">Propiedad</th>
              <th className="px-6 py-4 text-left">Estatus</th>
              <th className="px-6 py-4 text-left">Precio</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {propertiesWithImages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <img src={p.imageUrl || '/placeholder.jpg'} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
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
                <td className="px-6 py-4 font-medium text-slate-700">${p.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
