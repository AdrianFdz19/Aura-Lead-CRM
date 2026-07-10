'use client';

import React, { useEffect, useState } from 'react';
import LeadCard from './LeadCard';
import { useStore } from '@/store/useStore';
import Pusher from 'pusher-js';

// 1. DEFINICIÓN DE LAS COLUMNAS CON SUS IDs DE BASE DE DATOS (Mantenemos consistencia con tu API)
type ColumnId = 'nuevo' | 'calificado' | 'visita' | 'negociacion';

interface Column {
  id: ColumnId;
  title: string;
  color: string;
}

// Alineamos los IDs al singular exacto que devuelve Prisma
const KANBAN_COLUMNS: Column[] = [
  { id: 'nuevo', title: 'Primer Contacto', color: 'bg-blue-500' },
  { id: 'calificado', title: 'Calificados / Perfilados', color: 'bg-purple-500' },
  { id: 'visita', title: 'Cita / Recorrido', color: 'bg-amber-500' },
  { id: 'negociacion', title: 'Negociación / Cierre', color: 'bg-emerald-500' },
];

export default function KanbanBoard({ tenantId }: { tenantId: string }) {
  const leads = useStore((state) => state.leads);
  const setLeads = useStore((state) => state.setLeads);

  useEffect(() => {
    // 2. Cargamos datos una sola vez al montar
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch(console.error);
  }, [setLeads]);

  // 1. Extraemos las funciones del store
  const handleIncomingMessage = useStore((state) => state.handleIncomingMessage);
  const removeLead = useStore((state) => state.removeLead);

  useEffect(() => {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // 2. IMPORTANTE: Suscríbete a un canal global de la agencia
    // El backend debe enviar el trigger a "tenant-{tenantId}"
    const channel = pusherClient.subscribe(`tenant-${tenantId}`);

    channel.bind('new-message', (data: { conversation: any; lead: any; message: any }) => {
      // 3. Esto actualizará tanto el mensaje (si estás en el chat) como el Kanban
      handleIncomingMessage(data);
    });

    // 4. Escuchamos el nuevo evento de eliminación
    channel.bind('lead-deleted', (data: { leadId: string }) => {
      removeLead(data.leadId);
    });

    return () => {
      pusherClient.unsubscribe(`tenant-${tenantId}`);
      pusherClient.disconnect();
    };
  }, [handleIncomingMessage, removeLead, tenantId]);

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
          // Ahora column.id ("nuevo") coincide perfectamente con la clave de boardData
          const columnLeads = leads.filter((l) => l.status === column.id);

          return (
            <div
              key={column.id}
              className="w-80 flex-shrink-0 bg-slate-100 rounded-xl p-3 border border-slate-200/60 shadow-sm"
            >
              {/* Encabezado de la Columna */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-4 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-slate-700 text-sm">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                  {columnLeads.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas */}
              <div className="space-y-3 min-h-[500px]">
                {columnLeads.length > 0 ? (
                  columnLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
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
