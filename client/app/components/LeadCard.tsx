'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, UserPlus, ChevronLeft, Check, MessageSquare } from 'lucide-react';
import { Lead } from '../types/lead';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/store/useStore';
import { getInitials } from '../utils/getInitials';

export type LeadPriority = 'hot' | 'warm' | 'cold';

interface LeadCardProps {
  lead: Lead;
}

const priorityColors: Record<LeadPriority, { bg: string; borderLeft: string; label: string; text: string }> = {
  hot: { bg: 'bg-red-50/80 border-red-200', borderLeft: 'border-l-red-500', text: 'text-red-800', label: '🔥 Hot' },
  warm: { bg: 'bg-amber-50/80 border-amber-200', borderLeft: 'border-l-amber-500', text: 'text-amber-800', label: '⚡ Warm' },
  cold: { bg: 'bg-blue-50/80 border-blue-200', borderLeft: 'border-l-blue-500', text: 'text-blue-800', label: '❄️ Cold' },
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
  const [showAgentSubmenu, setShowAgentSubmenu] = useState(false);
  const currentUser = useStore(state => state.currentUser);
  const team = useStore(state => state.team);
  const assignAgentToLead = useStore(state => state.assignAgentToLead);

  // Buscamos el lead actual en el store usando el leadId
  const lead = useStore(state => state.leads.find(l => l.id === leadId));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAgentSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssignAgent = (agentId: string) => {
    assignAgentToLead(leadId, agentId);
    setIsOpen(false);
    setShowAgentSubmenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowAgentSubmenu(false);
        }}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors">
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
          {showAgentSubmenu ? (
            <div>
              <div className="flex items-center border-b border-slate-100 mb-1">
                <button
                  onClick={() => setShowAgentSubmenu(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full m-1"
                >
                  <ChevronLeft size={16} />
                </button>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Asignar Agente
                </h4>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {team && team.length > 0 ? (
                  team.map((agent) => {
                    const isAssigned = lead?.assignedToId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => handleAssignAgent(agent.id)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${isAssigned ? 'bg-indigo-50 font-semibold text-indigo-700' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${getAvatarColor(agent.name)}`}>
                              {getInitials(agent.name)}
                            </div>
                          )}
                          <span className="truncate">{agent.name}</span>
                        </div>
                        {isAssigned && (
                          <Check size={16} className="text-indigo-600" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 text-center">
                    No hay agentes disponibles
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {currentUser?.role === 'ADMIN' ? (
                <button
                  onClick={() => setShowAgentSubmenu(true)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserPlus size={16} className="text-slate-500" />
                  <span>Asignar agente</span>
                </button>
              ) : (
                <div className="px-4 py-2 text-xs text-slate-400 italic text-center">
                  Solo administradores pueden asignar.
                </div>
              )}
            </>
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
    opacity: isDragging ? 0.5 : 1,
  };

  const rawPriority = (lead.priority?.toLowerCase() || 'warm') as LeadPriority;
  const currentPriority = priorityColors[rawPriority] || priorityColors.warm;

  const currentUser = useStore(state => state.currentUser);
  const team = useStore(state => state.team);

  const assignedAgent = team.find(agent => agent.id === lead.assignedToId);

  // Función para manejar la apertura del chat con el lead
  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se active el drag o eventos padres no deseados
    // Aquí puedes disparar tu lógica para abrir el chat (ej. cambiar un estado global, router.push, etc.)
    console.log(`Abrir chat con lead: ${lead.id} - ${lead.name}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: isDragging ? 50 : 1,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
      className={`w-full bg-white rounded-xl shadow-sm border-l-4 border-y border-r border-slate-200 p-4 hover:shadow-md transition-all cursor-grab ${currentPriority.borderLeft}`}
    >
      {/* 1. Header con Iniciales y Badge de Prioridad */}
      <div
        {...listeners}
        className="flex items-center gap-3 mb-3"
      >
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
          {currentUser?.role === 'ADMIN' && assignedAgent && (
            <div className="flex items-center gap-1.5">
              {assignedAgent.avatar ? (
                <img 
                  src={assignedAgent.avatar} 
                  alt={assignedAgent.name} 
                  className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm"
                  title={`Asignado a: ${assignedAgent.name}`}
                />
              ) : (
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${getAvatarColor(assignedAgent.name)}`}
                  title={`Asignado a: ${assignedAgent.name}`}
                >
                  {getInitials(assignedAgent.name)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón de Chat y Menú de acciones */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenChat}
            title="Abrir chat"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <MessageSquare size={16} />
          </button>
          <DropdownMenu leadId={lead.id} />
        </div>
      </div>
    </div>
  );
}