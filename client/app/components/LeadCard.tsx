'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MoreHorizontal, UserPlus } from 'lucide-react';
import { Lead } from '../types/lead';
import { useSortable } from '@dnd-kit/sortable'; // 1. Importa el hook
import { CSS } from '@dnd-kit/utilities'; // 2. Importa para el estilo
import { useStore } from '@/store/useStore';
import { getInitials } from '../utils/getInitials';

export type LeadPriority = 'hot' | 'warm' | 'cold';

// Props del componente principal
interface LeadCardProps {
  lead: Lead;
}

const priorityColors: Record<LeadPriority, { bg: string; borderLeft: string; label: string; text: string }> = {
  hot: { bg: 'bg-red-50/80 border-red-200', borderLeft: 'border-l-red-500', text: 'text-red-800', label: '🔥 Caliente' },
  warm: { bg: 'bg-amber-50/80 border-amber-200', borderLeft: 'border-l-amber-500', text: 'text-amber-800', label: '⚡ Tibio' },
  cold: { bg: 'bg-blue-50/80 border-blue-200', borderLeft: 'border-l-blue-500', text: 'text-blue-800', label: '❄️ Frío' },
};

const getAvatarColor = (name: string) => {
  const firstLetter = name.trim()[0]?.toUpperCase() || 'A';
  const charCode = firstLetter.charCodeAt(0);
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-orange-100 text-orange-700 border-orange-200',
  ];
  return colors[charCode % colors.length];
};

// --- INICIO: Componente para el Menú Contextual ---
interface DropdownMenuProps {
  leadId: string;
}

function DropdownMenu({ leadId }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentUser = useStore(state => state.currentUser);
  const team = useStore(state => state.team);
  const assignAgentToLead = useStore(state => state.assignAgentToLead);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssignAgent = (agentId: string) => {
    assignAgentToLead(leadId, agentId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors">
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
          {currentUser?.role === 'ADMIN' && (
            <div className="relative group">
              <div className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700">
                <UserPlus size={16} /> Asignar a un agente
              </div>
              <div className="absolute left-full top-0 mt-[-8px] w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block">
                {team.map(agent => (
                  <button key={agent.id} onClick={() => handleAssignAgent(agent.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{agent.name}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// --- FIN: Componente para el Menú Contextual ---

export default function LeadCard({ lead }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Feedback visual al arrastrar
  };
  // 1. Validar la prioridad de forma segura (Backend a veces envía 'HOT' o string genérico)
  const rawPriority = (lead.priority?.toLowerCase() || 'warm') as LeadPriority;
  const currentPriority = priorityColors[rawPriority] || priorityColors.warm;

  const [agentAssigned, setAgentAssigned] = useState<any>();

  // Info del agente asignado si es que tiene uno
  useEffect(() => {
    if (lead.AssignedToId) {
      setAgentAssigned({
        id: '01',
        name: 'Adrian Ruiz'
      });
    }
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: isDragging ? 50 : 1,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
      {...attributes}
      {...listeners}
      className={`w-full bg-white rounded-xl shadow-sm border-l-4 border-y border-r border-slate-200 p-4 hover:shadow-md transition-all cursor-grab ${currentPriority.borderLeft}`}
    >

      {/* 1. Header con Iniciales y Badge de Prioridad */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar dinámico */}
        <div className={`relative w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-xs font-bold border ${getAvatarColor(lead.name)}`}>
          {getInitials(lead.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${currentPriority.bg} ${currentPriority.text}`}>
              {currentPriority.label}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Último mensaje real de la BD */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-2">
          {lead.lastMessage ? `"${lead.lastMessage}"` : "💬 Sin mensajes previos"}
        </p>
      </div>

      {/* 3. Acciones de contacto directo */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Avatar del agente asignado */}
          {agentAssigned && (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ${getAvatarColor('Adrian Ruiz')}`}
              title={`Asignado a: nombre-agente`}
            >
              {getInitials('Adrian Ruiz')}
            </div>
          )}
        </div>

        {/* Menú de acciones */}
        <div className="flex items-center">
          <DropdownMenu leadId={'01'} />
        </div>
      </div>
    </div>
  );
}
