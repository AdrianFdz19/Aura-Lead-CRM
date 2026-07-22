// components/ClientLayoutWrapper.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import CrmHeader from "../components/CrmHeader";
import ChatModal from "../components/ChatModal";
import Navbar from "./Navbar";
import { useMediaQuery } from "../hooks/useMediaQuery";
import MobileBottomNav from "./MobileBottomNav";
import { useStore } from "@/store/useStore";
import { User } from "../types/user";

export default function ClientLayoutWrapper({ children, user }: { children: React.ReactNode, user: User | null }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setCurrentUser } = useStore();
  const initialized = useRef(false);

  // Usamos useEffect para hidratar el store solo una vez en el cliente
  useEffect(() => {
    if (user && !initialized.current) {
      setCurrentUser(user);
      initialized.current = true; // Marcamos como inicializado
    }
  }, [user, setCurrentUser]);

  return (
    // 1. Grid modificado:
    // En escritorio (md): mantiene columnas laterales.
    // En móvil: una sola columna, dos filas (contenido + navbar).
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] grid-rows-[64px_1fr_64px] md:grid-rows-[64px_1fr] h-screen overflow-hidden bg-gray-50">

      {/* Header: Visible siempre */}
      <div className="col-start-1 md:col-start-2 row-start-1 bg-white z-10 border-b">
        <CrmHeader onOpenChat={() => setIsChatOpen(true)} />
      </div>

      {/* Renderizado condicional del Navegador */}
      {isMobile ? (
        <div className="row-start-3 col-start-1 z-20">
          <MobileBottomNav />
        </div>
      ) : (
        <div className="row-span-2 col-start-1 bg-slate-900 z-20">
          <Navbar />
        </div>
      )}

      {/* Contenido: 
          - Móvil: Fila 2, ocupa todo el ancho.
          - Escritorio: Columna 2, Fila 2.
      */}
      <main className="col-start-1 md:col-start-2 row-start-2 h-full overflow-y-auto p-0 md:p-6">
        {children}
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}