"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { UserPlus, Mail, Phone, MoreVertical, Shield, User, CheckCircle, Search, Edit, UserX, Activity } from 'lucide-react';
import AddAgentForm from '@/app/components/AddAgentForm';

// Datos simulados para los miembros del equipo
const teamMembers = [
  {
    id: 1,
    name: 'Elena García',
    role: 'Admin',
    status: 'Active',
    email: 'elena.garcia@aura.com',
    phone: '+1234567890',
    avatar: 'EG',
    bgColor: 'bg-indigo-100 text-indigo-600',
    stats: {
      leads: 45,
      closedDeals: 12,
    },
  },
  {
    id: 2,
    name: 'Carlos Martínez',
    role: 'Sales Agent',
    status: 'Active',
    email: 'carlos.martinez@aura.com',
    phone: '+1234567891',
    avatar: 'CM',
    bgColor: 'bg-emerald-100 text-emerald-600',
    stats: {
      leads: 78,
      closedDeals: 21,
    },
  },
  {
    id: 3,
    name: 'Sofía Rodríguez',
    role: 'Sales Agent',
    status: 'Active',
    email: 'sofia.rodriguez@aura.com',
    phone: '+1234567892',
    avatar: 'SR',
    bgColor: 'bg-pink-100 text-pink-600',
    stats: {
      leads: 62,
      closedDeals: 18,
    },
  },
  {
    id: 4,
    name: 'Javier Hernández',
    role: 'Sales Agent',
    status: 'Inactive',
    email: 'javier.hernandez@aura.com',
    phone: '+1234567893',
    avatar: 'JH',
    bgColor: 'bg-slate-100 text-slate-500',
    stats: {
      leads: 33,
      closedDeals: 9,
    },
  },
];

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return teamMembers.filter(member => {
      const searchMatch = searchTerm === '' ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const roleMatch = roleFilter === 'All' || member.role === roleFilter;
      const statusMatch = statusFilter === 'All' || member.status === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  const toggleMenu = (memberId: number) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

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
            <option value="Admin">Admin</option>
            <option value="Sales Agent">Sales Agent</option>
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
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${member.bgColor} flex items-center justify-center font-bold text-lg`}>
                  {member.avatar}
                </div>
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
                      <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <UserX size={16} /> Deactivate
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="font-bold text-slate-800 text-lg">{member.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                {member.role === 'Admin' ? <Shield size={14} className="text-indigo-500" /> : <User size={14} className="text-emerald-500" />}
                <span>{member.role}</span>
              </div>

              <div className="mt-4 space-y-2">
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  <Mail size={14} className="text-slate-400" />
                  {member.email}
                </a>
                <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  <Phone size={14} className="text-slate-400" />
                  {member.phone}
                </a>
              </div>
            </div>

            {/* Stats y Estado */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-4">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xs text-slate-500">Leads</p>
                  <p className="font-bold text-slate-700 text-lg">{member.stats.leads}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Closed</p>
                  <p className="font-bold text-slate-700 text-lg">{member.stats.closedDeals}</p>
                </div>
              </div>
            </div>

            {/* Footer de la tarjeta con el estado */}
            <div className={`px-4 py-2 border-t text-xs font-semibold flex items-center justify-center gap-2
              ${member.status === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {member.status === 'Active' && <CheckCircle size={14} />}
              <span>{member.status}</span>
            </div>
          </div>
        ))}
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

            <AddAgentForm onClose={() => setIsAddAgentModalOpen(false)} />

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
