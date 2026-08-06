"use client";

import { useStore } from '@/store/useStore';
import { Mail, ShieldCheck, Users, Briefcase, Activity } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const currentUser = useStore(state => state.currentUser);
  const leads = useStore((state) => state.leads);
  const setLeads = useStore(state => state.setLeads);

  useEffect(() => {
    // 2. Cargamos datos una sola vez al montar
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch(console.error);
  }, [setLeads]);

  console.log(leads);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 p-4 md:p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tarjeta Principal de Usuario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
              <p className="text-slate-500 text-sm">Tenant ID: {currentUser.tenantId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-slate-700">
              <Mail size={18} className="text-slate-400" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck size={18} className="text-slate-400" />
              <span>Rol: <span className="font-semibold capitalize">{currentUser.role?.toLowerCase()}</span></span>
            </div>
          </div>
        </div>

        {/* Sección de KPIs / Métricas para rellenar y dar aspecto Pro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase">Leads Asignados</p>
              <h3 className="text-xl font-bold text-slate-800">12</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase">Proyectos Activos</p>
              <h3 className="text-xl font-bold text-slate-800">4</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Activity size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase">Estado del Sistema</p>
              <h3 className="text-xl font-bold text-emerald-600">Activo</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}