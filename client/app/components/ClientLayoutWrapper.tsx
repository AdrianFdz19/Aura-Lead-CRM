// components/ClientLayoutWrapper.tsx
"use client";
import { useState } from "react";
import CrmHeader from "../components/CrmHeader";
import ChatModal from "../components/ChatModal";
import Navbar from "./Navbar";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    // Usamos grid para definir áreas fijas
    <div className="grid grid-cols-[auto_1fr] grid-rows-[64px_1fr] h-screen overflow-hidden bg-gray-50">
      
      {/* Header: Columna 2, Fila 1 */}
      <div className="col-start-2 row-start-1 bg-white z-10">
        <CrmHeader brokerName="Adrian Fernandez" brokerRole="agente" onOpenChat={() => setIsChatOpen(true)} />
      </div>

      {/* Navbar: Fila 1 y 2, Columna 1 (Fijo) */}
      <div className="row-span-2 bg-slate-900 z-20">
        <Navbar />
      </div>

      {/* Contenido: Columna 2, Fila 2 (Scrollable) */}
      <main className="col-start-2 row-start-2 overflow-y-auto">
        {children}
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}