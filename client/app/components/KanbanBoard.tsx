'use client';

import React, { useState } from 'react';
import LeadCard, { Lead } from './LeadCard';

// 1. DEFINICIÓN DE LAS 4 COLUMNAS TÍPICAS
type ColumnId = 'nuevos' | 'calificados' | 'visitas' | 'negociacion';

interface Column {
  id: ColumnId;
  title: string;
  color: string; // Color para la barra superior de cada columna
}

const KANBAN_COLUMNS: Column[] = [
  { id: 'nuevos', title: 'Primer Contacto', color: 'bg-blue-500' },
  { id: 'calificados', title: 'Calificados / Perfilados', color: 'bg-purple-500' },
  { id: 'visitas', title: 'Cita / Recorrido', color: 'bg-amber-500' },
  { id: 'negociacion', title: 'Negociación / Cierre', color: 'bg-emerald-500' },
];

export default function KanbanBoard() {
  // 2. ESTADO DEL KANBAN SEPARADO POR CLASIFICACIÓN
  const [boardData, setBoardData] = useState<Record<ColumnId, Lead[]>>({
    nuevos: [
      {
        id: "lead_01",
        name: "Sofía Martínez",
        priority: "hot",
        operation: "Comprar",
        phone: "+525512345678",
        email: "sofia.mtz@email.com",
        budget: "$3,500,000 - $4,200,000",
        zones: ["Polanco", "Anzures"],
        specs: "3 Rec. / 2 Baños / Terraza",
        lastInteraction: "Llamada 28/06: Quiere ver opciones el fin de semana.",
        nextTask: "Agendar cita de recorrido",
        nextTaskDate: "02 Jul, 10:00 am",
        source: "Inmuebles24",
        agent: "Carlos R."
      }
    ],
    calificados: [
      {
        id: "lead_02",
        name: "Alejandro Ruiz",
        priority: "warm",
        operation: "Rentar",
        phone: "+525598765432",
        email: "alejandro.ruiz@email.com",
        budget: "$25,000 - $30,000",
        zones: ["Roma Norte", "Condesa"],
        specs: "1 o 2 Rec. / Amueblado / Pet-friendly",
        lastInteraction: "WhatsApp 29/06: Presupuesto y aval validados.",
        nextTask: "Enviar opciones por correo",
        nextTaskDate: "30 Jun, 05:00 pm",
        source: "Facebook Ads",
        agent: "Laura G."
      }
    ],
    visitas: [
      {
        id: "lead_03",
        name: "Mariana Costa",
        priority: "hot",
        operation: "Comprar",
        phone: "+525544332211",
        email: "mariana.c@email.com",
        budget: "$6,000,000",
        zones: ["Lomas de Chapultepec"],
        specs: "Casa / Jardín / Seguridad 24/7",
        lastInteraction: "Cita confirmada: Segunda visita con su familia.",
        nextTask: "Mostrar Casa Monte Everest",
        nextTaskDate: "01 Jul, 04:30 pm",
        source: "Recomendado",
        agent: "Carlos R."
      }
    ],
    negociacion: [
      {
        id: "lead_04",
        name: "Roberto Gómez",
        priority: "warm",
        operation: "Vender",
        phone: "+525522110099",
        email: "roberto.g@email.com",
        budget: "Valuación: $4,800,000",
        zones: ["Del Valle"],
        specs: "Depto 120m² / 2 Estac.",
        lastInteraction: "Contrato de exclusividad en revisión por el cliente.",
        nextTask: "Llamada de seguimiento a firmas",
        nextTaskDate: "03 Jul, 12:00 pm",
        source: "Sitio Web",
        agent: "Laura G."
      }
    ]
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 overflow-x-auto">
      
      {/* Encabezado del Tablero */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pipeline Inmobiliario</h1>
        <p className="text-sm text-slate-500">Gestiona tus leads y el seguimiento de propiedades en tiempo real.</p>
      </div>

      {/* 3. GRID DEL TABLERO KANBAN */}
      <div className="flex gap-4 min-w-[1000px] items-start">
        {KANBAN_COLUMNS.map((column) => {
          const columnLeads = boardData[column.id];

          return (
            <div 
              key={column.id} 
              className="w-80 flex-shrink-0 bg-slate-100 rounded-xl p-3 border border-slate-200/60 shadow-sm"
            >
              {/* Encabezado de la Columna */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  {/* Línea o punto de color según la fase */}
                  <span className={`w-2 h-4 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-slate-700 text-sm">
                    {column.title}
                  </h3>
                </div>
                {/* Contador de leads */}
                <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                  {columnLeads.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas (Drop Zone simulada) */}
              <div className="space-y-3 min-h-[500px]">
                {columnLeads.length > 0 ? (
                  columnLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
                  // Estado vacío si la columna no tiene leads
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl h-32 text-slate-400 text-xs text-center p-4">
                    <span>Sin leads en esta fase</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
