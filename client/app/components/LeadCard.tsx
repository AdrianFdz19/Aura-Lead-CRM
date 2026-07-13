'use client';

import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Lead } from '../types/lead';
import { useSortable } from '@dnd-kit/sortable'; // 1. Importa el hook
import { CSS } from '@dnd-kit/utilities'; // 2. Importa para el estilo

export type LeadPriority = 'hot' | 'warm' | 'cold';

interface LeadCardProps {
  lead: Lead;
}

const priorityColors: Record<LeadPriority, { bg: string; borderLeft: string; label: string; text: string }> = {
  hot: { bg: 'bg-red-50/80 border-red-200', borderLeft: 'border-l-red-500', text: 'text-red-800', label: '🔥 Caliente' },
  warm: { bg: 'bg-amber-50/80 border-amber-200', borderLeft: 'border-l-amber-500', text: 'text-amber-800', label: '⚡ Tibio' },
  cold: { bg: 'bg-blue-50/80 border-blue-200', borderLeft: 'border-l-blue-500', text: 'text-blue-800', label: '❄️ Frío' },
};

// Funciones utilitarias para el Avatar
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : '??';
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
        <div className={`w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-xs font-bold border ${getAvatarColor(lead.name)}`}>
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
        <div className="flex gap-1">
          {lead.phone && (
            <button
              onClick={() => window.open(`tel:${lead.phone}`)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Llamar"
            >
              <Phone size={14} />
            </button>
          )}
          {lead.email && (
            <button
              onClick={() => window.open(`mailto:${lead.email}`)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Enviar correo"
            >
              <Mail size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
