import React from 'react';
import { Phone, Mail, MapPin, Calendar, DollarSign, User } from 'lucide-react';

export type LeadPriority = 'hot' | 'warm' | 'cold';
export type OperationType = 'Comprar' | 'Rentar' | 'Vender';

export interface Lead {
  id: string;
  name: string;
  priority: LeadPriority;
  operation: OperationType;
  phone: string;
  email: string;
  budget: string;
  zones: string[];
  specs: string;
  lastInteraction: string;
  nextTask: string;
  nextTaskDate: string;
  source: string;
  agent: string;
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

export default function LeadCard({ lead }: LeadCardProps) {
  const currentPriority = priorityColors[lead.priority];
  const avatarStyle = getAvatarColor(lead.name);
  const initials = getInitials(lead.name);

  const handlePhoneClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(`tel:${lead.phone}`);
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(`mailto:${lead.email}`);
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-4 cursor-grab active:cursor-grabbing select-none">
      
      {/* 1. ENCABEZADO CON AVATAR NUEVO */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Circular Dinámico */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 border ${avatarStyle}`}>
            {initials}
          </div>
          
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm md:text-base leading-tight truncate">
              {lead.name}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
              {lead.operation}
            </span>
          </div>
        </div>
        
        {/* Etiqueta de Prioridad */}
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${currentPriority.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
          {currentPriority.label}
        </span>
      </div>

      {/* 2. ACCIONES RÁPIDAS Y PRESUPUESTO */}
      <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-1 text-emerald-700 font-semibold text-sm">
          <DollarSign className="w-4 h-4 shrink-0" />
          <span>{lead.budget}</span>
        </div>
        
        <div className="flex gap-1.5">
          <button 
            onClick={handlePhoneClick}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
            title="Llamar"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={handleEmailClick}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
            title="Enviar Correo"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. REQUISITOS */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-4">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-700">Zonas:</strong> {lead.zones.join(', ')}
          </span>
        </div>
        <div className="pl-5 text-slate-500 italic">
          {lead.specs}
        </div>
      </div>

      {/* 4. HISTORIAL Y PRÓXIMA ACCIÓN */}
      <div className="bg-slate-50 rounded-lg p-2.5 text-xs border border-slate-100 mb-3">
        <div className="text-slate-500 mb-1.5 line-clamp-2">
          <span className="font-medium text-slate-700">Última nota:</span> {lead.lastInteraction}
        </div>
        <div className="flex items-center justify-between bg-amber-50 text-amber-800 border border-amber-100 rounded px-2 py-1 font-medium">
          <div className="flex items-center gap-1 truncate">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{lead.nextTask}</span>
          </div>
          <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-900 whitespace-nowrap ml-1">
            {lead.nextTaskDate}
          </span>
        </div>
      </div>

      {/* 5. PIE DE TARJETA */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
          {lead.source}
        </span>
        <div className="flex items-center gap-1 text-slate-600 font-medium">
          <User className="w-3 h-3 text-slate-400" />
          <span>{lead.agent}</span>
        </div>
      </div>

    </div>
  );
}
