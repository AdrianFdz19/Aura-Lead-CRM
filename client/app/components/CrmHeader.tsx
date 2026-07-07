'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Bot, LogOut, User, ChevronDown } from 'lucide-react';

export default function CrmHeader({ onOpenChat, brokerName, brokerRole }: {
  onOpenChat: () => void,
  brokerName: string,
  brokerRole: 'admin' | 'agente'
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenChat}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Bot size={18} />
          Asistente
        </button>
      </div>

      {/* Contenedor del Perfil con Dropdown */}
      <div className="relative" ref={menuRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
            {brokerName.charAt(0)}
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-none">{brokerName}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">{brokerRole}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Modal Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => window.location.href = '/profile'}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User size={16} />
              Mi Perfil
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}