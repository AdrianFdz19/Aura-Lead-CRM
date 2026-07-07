import React from 'react';
import { Phone, Mail, Clock, MapPin, Calendar, DollarSign, User } from 'lucide-react';

export type LeadPriority = 'hot' | 'warm' | 'cold';
export type OperationType = 'Comprar' | 'Rentar' | 'Vender';

export interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  // Campos que vienen de Prisma
  status: string;
  customMetadata: any; 
  // Campo que calculamos en el API
  lastInteraction: string; 
  // Campos que antes eran fijos, ahora pueden ser dinámicos
  priority?: 'hot' | 'warm' | 'cold'; 
}

interface LeadCardProps {
  lead: Lead;
}

const priorityColors: Record<LeadPriority, { bg: string; dot: string; label: string }> = {
  hot: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Caliente' },
  warm: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Tibio' },
  cold: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Frío' },
};

// 🌟 FUNCIONES UTILITARIAS PARA EL AVATAR
// Obtiene las iniciales (Ej: "Sofía Martínez" -> "SM")
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : '??';
};

// Asigna un color Tailwind fijo basado en la primera letra del nombre
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

  // Usamos el código de la letra para elegir siempre el mismo índice
  return colors[charCode % colors.length];
};

export default function LeadCard({ lead }: { lead: Lead }) {
  // Fallback seguro si no hay prioridad asignada aún en el metadata
  const priority = lead.priority ?? 'warm'; 
  const currentPriority = priorityColors[priority];

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm border-l-4 ${currentPriority.bg} border border-slate-200 p-4 hover:shadow-md transition-all cursor-grab`}>
      
      {/* 1. Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
          {/* Aquí podrías extraer la operación del metadata si la guardas ahí */}
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {lead.customMetadata?.operation ?? 'Sin operación'}
          </span>
        </div>
      </div>

      {/* 2. Último mensaje real de la BD */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
          "{lead.lastInteraction}"
        </p>
      </div>

      {/* 3. Acciones */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => window.open(`tel:${lead.phone}`)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
            <Phone size={16} />
          </button>
          <button onClick={() => window.open(`mailto:${lead.email}`)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
            <Mail size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <Clock size={12} />
          <span>{new Date(lead.customMetadata?.nextTaskDate || new Date()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
