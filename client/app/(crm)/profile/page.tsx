"use client";

import { useStore } from '@/store/useStore';
import { Mail, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const currentUser = useStore(state => state.currentUser);

  // Muestra un estado de carga mientras el store se hidrata
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-slate-500">{currentUser.tenantId}</p>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-slate-700"><Mail size={16} className="text-slate-400" /> {currentUser.email}</div>
          <div className="flex items-center gap-3 text-slate-700"><ShieldCheck size={16} className="text-slate-400" /> Rol: <span className="font-semibold capitalize">{currentUser.role.toLowerCase()}</span></div>
        </div>
      </div>
    </div>
  );
}
