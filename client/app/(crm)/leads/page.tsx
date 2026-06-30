'use client';

import KanbanBoard from '@/app/components/KanbanBoard';
import LeadCard, { type Lead } from '@/app/components/LeadCard';
import React, { useState } from 'react';
// Importamos el componente hijo y su interfaz de tipo

export default function Leads() {

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Pipeline de Ventas</h1>
      
      <KanbanBoard />
    </div>
  );
}
