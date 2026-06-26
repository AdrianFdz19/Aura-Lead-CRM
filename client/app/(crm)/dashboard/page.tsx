import PropertyForm from "@/app/components/PropertyForm";
import { Bot, Search, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getSession } from "@/lib/auth";

/* <PropertyForm tenantId={session.tenantId} /> */

// Mock de propiedades
const properties = [
  { id: 1, name: 'Vila Toscana', location: 'Rosewood Street', type: 'Residential', status: 'Available', price: '$5,000/mo', leads: 5, commission: '$2,500' },
  { id: 2, name: 'Sunset Heights', location: 'Brooklyn, NY', type: 'Commercial', status: 'Occupied', price: '$12,000/mo', leads: 2, commission: '$6,000' },
];

export default async function Dashboard() {
  const session = await getSession();

  // Asegúrate de que exista la sesión antes de renderizar
  if (!session) return null;

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">

      {/* 1. Métricas Superiores */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Propiedades Activas', value: '22', icon: <Briefcase /> },
          { label: 'Solicitudes Pendientes', value: '45', icon: <Users /> },
          { label: 'Tasa de Ocupación', value: '92%', icon: <TrendingUp /> },
          { label: 'Comisión Estimada', value: '$128,450', icon: <DollarSign /> },
        ].map((stat, i) => (
          <div key={i} className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* 2. AI Assistant & Tabla */}
      <div className="grid grid-cols-12 gap-6">

        {/* Columna Izquierda: IA Assistant */}
        <div className="col-span-3">
          <div className="p-6 border rounded-xl bg-indigo-50 border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="text-indigo-600" />
              <h2 className="font-bold text-lg">AI Assistant</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">¿En qué puedo ayudarte hoy?</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Nueva Acción</button>
          </div>
        </div>

        {/* Columna Derecha: Inventario */}
        <div className="col-span-9">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Inventario de Propiedades</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input className="pl-9 pr-4 py-2 border rounded-lg text-sm" placeholder="Buscar propiedad..." />
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Propiedad</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Estatus</th>
                  <th className="p-4 text-left">Precio</th>
                  <th className="p-4 text-left">Leads</th>
                  <th className="p-4 text-left">Comisión</th>
                  <th className="p-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{p.name}<br /><span className="text-xs text-gray-400">{p.location}</span></td>
                    <td className="p-4 text-gray-600">{p.type}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">{p.status}</span></td>
                    <td className="p-4">{p.price}</td>
                    <td className="p-4">{p.leads}</td>
                    <td className="p-4 font-semibold">{p.commission}</td>
                    <td className="p-4 text-indigo-600 cursor-pointer font-medium">IA Actions</td>
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
