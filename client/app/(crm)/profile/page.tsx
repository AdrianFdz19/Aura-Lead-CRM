"use client";

import { useStore } from '@/store/useStore';
import { Mail, ShieldCheck, Users, Briefcase, Activity, Phone, Building2, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const currentUser = useStore(state => state.currentUser);
  const leads = useStore((state) => state.leads);
  const setLeads = useStore(state => state.setLeads);

  useEffect(() => {
    // Cargamos los datos de los leads al montar
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch(console.error);
  }, [setLeads]);

  console.log(leads);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50/50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-sm text-slate-500">Administra tu información personal y visualiza tus asignaciones en el sistema.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Sesión Activa
            </span>
          </div>
        </div>

        {/* Tarjeta Principal de Usuario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-md shadow-indigo-200">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-sm">
                <Building2 size={15} className="text-slate-400" />
                <span>Tenant ID: <strong className="text-slate-700 font-medium">{currentUser.tenantId}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="p-2 bg-white rounded-lg shadow-xs text-indigo-600">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Correo Electrónico</p>
                <span className="font-medium text-slate-800">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="p-2 bg-white rounded-lg shadow-xs text-indigo-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Rol en el Sistema</p>
                <span className="font-semibold text-slate-800 capitalize">{currentUser.role?.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de KPIs / Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:border-indigo-200">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={22} /></div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Leads Asignados</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{leads.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:border-emerald-200">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase size={22} /></div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Proyectos Activos</p>
              <h3 className="text-2xl font-extrabold text-slate-800">4</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 transition-all hover:border-amber-200">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl"><Activity size={22} /></div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Estado Operativo</p>
              <h3 className="text-lg font-bold text-emerald-600 mt-0.5">En Línea</h3>
            </div>
          </div>
        </div>

        {/* Sección de Leads Asignados (Detalle visual estilo CRM) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Prospectos y Leads a tu Cargo</h3>
              <p className="text-xs text-slate-500">Listado de registros vinculados directamente a tu usuario.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
              {leads.length} total
            </span>
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">No tienes leads asignados actualmente</p>
                <p className="text-xs text-slate-400 max-w-xs">Los prospectos que te sean asignados en el CRM aparecerán automáticamente listados en esta sección.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Cliente / Lead</th>
                    <th className="py-3 px-6">Contacto</th>
                    <th className="py-3 px-6">Estado</th>
                    <th className="py-3 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {leads.map((lead: any, index: number) => (
                    <tr key={lead.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {lead.name || lead.companyName || 'Sin Nombre'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          <span>{lead.phone || lead.email || 'N/D'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/50">
                          {lead.status || 'Activo'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}