"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { UserPlus, Mail, Phone, MoreVertical, Shield, User, CheckCircle, Search, Edit, UserX, Activity } from 'lucide-react';
import AddAgentForm from '@/app/components/AddAgentForm';
import { useStore } from '@/store/useStore';
import { TeamUser } from '@/app/types/user';

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Obtenemos el equipo, el usuario actual y la acción para eliminar del store
  const team: TeamUser[] = useStore((state) => state.team);
  const currentUser = useStore((state) => state.currentUser);
  const removeAgentFromStore = useStore((state) => state.removeAgent);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMembers = useMemo(() => {
    return team.filter(member => {
      const searchMatch = searchTerm === '' ||
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const memberRoleFormatted = member.role === 'ADMIN' ? 'ADMIN' : 'AGENT';
      const roleMatch = roleFilter === 'All' || memberRoleFormatted === roleFilter;
      
      const memberStatusFormatted = member.isActive ? 'Active' : 'Inactive';
      const statusMatch = statusFilter === 'All' || memberStatusFormatted === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  const toggleMenu = (memberId: string) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  // Eliminar a un agente del equipo
  const deleteAgent = useCallback(async (agentId: string) => {
    // Confirmación para evitar borrados accidentales
    if (!window.confirm("¿Estás seguro de que quieres eliminar a este agente? Esta acción es irreversible y liberará sus leads asignados.")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${agentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // 2. Si la API responde con éxito, eliminamos el agente del estado local
        removeAgentFromStore(agentId);
        setOpenMenuId(null); // Cerramos el menú
      } else {
        const errorData = await res.json();
        alert(`Error al eliminar el agente: ${errorData.error || 'Inténtalo de nuevo.'}`);
      }
    } catch (err) {
      console.error("Error de red o de cliente:", err);
      alert("Ocurrió un error de conexión. Por favor, inténtalo de nuevo.");
    }
  }, [removeAgentFromStore]);

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1">View, manage, and invite team members.</p>
        </div>
        <button
          onClick={() => setIsAddAgentModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          <span>Add New Agent</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full outline-none"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="AGENT">Sales Agent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Miembros del Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => {
          const roleLabel = member.role === 'ADMIN' ? 'Admin' : 'Sales Agent';
          const isActive = member.isActive;
          const statusLabel = isActive ? 'Active' : 'Inactive';
          
          // Generar iniciales para el avatar en caso de que no tenga foto
          const initials = member.name
            ? member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'US';

          return (
            <div key={member.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  {member.avatar ? (
                    <img 
                      src={`${member.avatar}`} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {initials}
                    </div>
                  )}
                  <div className="relative" ref={openMenuId === member.id ? menuRef : null}>
                    <button onClick={() => toggleMenu(member.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === member.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-10 animate-in fade-in zoom-in-95">
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Edit size={16} /> Edit Role
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Activity size={16} /> View Activity
                        </button>
                        <div className="border-t my-1" />
                        {/* 3. Lógica de renderizado condicional para el botón de eliminar */}
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => deleteAgent(member.id)}
                            disabled={currentUser.id === member.id} // Deshabilitado para el propio admin
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={currentUser.id === member.id ? "No puedes eliminar tu propia cuenta" : "Eliminar agente"}
                          >
                            <UserX size={16} />
                            <span>
                              {currentUser.id === member.id ? 'Cannot Delete Self' : 'Delete Agent'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="font-bold text-slate-800 text-lg">{member.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  {roleLabel === 'Admin' ? <Shield size={14} className="text-indigo-500" /> : <User size={14} className="text-emerald-500" />}
                  <span>{roleLabel}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors truncate">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Stats y Estado (Placeholder dinámico o adaptable según tus relaciones de Leads) */}
              <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-xs text-slate-500">Leads</p>
                    <p className="font-bold text-slate-700 text-lg">{member.leadsCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Closed</p>
                    <p className="font-bold text-slate-700 text-lg">0</p>
                  </div>
                </div>
              </div>

              {/* Footer de la tarjeta con el estado */}
              <div className={`px-4 py-2 border-t text-xs font-semibold flex items-center justify-center gap-2
                ${isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {isActive && <CheckCircle size={14} />}
                <span>{statusLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Agregar Nuevo Agente */}
      {isAddAgentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800">Register New Agent</h2>
              <p className="text-sm text-slate-500 mt-1">Fill in the details to invite a new member to the team.</p>
            </div>

            <AddAgentForm 
              onClose={() => {
                setIsAddAgentModalOpen(false);
              }} 
            />

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddAgentModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <label htmlFor="add-agent-submit-button" className="cursor-pointer px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Create Agent
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}