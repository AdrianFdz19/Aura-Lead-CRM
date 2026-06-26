// components/ClientLayoutWrapper.tsx
"use client";
import { useState } from "react";
import CrmHeader from "../components/CrmHeader";
import ChatModal from "../components/ChatModal";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CrmHeader onOpenChat={() => setIsChatOpen(true)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {children}
    </div>
  );
}