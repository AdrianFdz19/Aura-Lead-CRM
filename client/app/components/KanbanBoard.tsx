'use client';

import React, { useEffect, useState } from 'react';
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
  const [boardData, setBoardData] = useState<Record<string, any[]>>({
    nuevos: [],
    calificados: [],
    visitas: [],
    negociacion: [],
  });

  const [loading, setLoading] = useState(true);

  // Traer la informacion de los Leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`/api/leads`);
        const data = await response.json();

        // Clasificar los leads recibidos según su status de base de datos
        const grouped = {
          nuevos: data.filter((l: any) => l.status === 'nuevo'),
          calificados: data.filter((l: any) => l.status === 'calificado'),
          visitas: data.filter((l: any) => l.status === 'visita'),
          negociacion: data.filter((l: any) => l.status === 'negociacion'),
        };

        setBoardData(grouped);
      } catch (err) {
        console.error("Error al cargar leads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) return <div className="p-8">Cargando tablero...</div>;

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
                    <LeadCard
                      key={lead.id}
                      lead={{
                        ...lead,
                        lastInteraction: lead.lastMessage || "Sin mensajes", // Mapeo para tu LeadCard
                        priority: 'hot', // Temporal: puedes añadir un campo 'priority' en tu BD
                        operation: 'N/A' // Temporal: mapear desde customMetadata
                      }}
                    />
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
