'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Bot, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getInitials } from '../utils/getInitials';

export default function CrmHeader({ onOpenChat }: { onOpenChat: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentUser = useStore(state => state.currentUser);

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
    useStore.getState().reset();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenChat}
          className="group relative inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all duration-200"
        >
          {/* Contenedor del icono con un ligero efecto de pulso o rotación al hacer hover */}
          <div className="p-1 bg-white/10 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <Bot size={18} className="text-indigo-100" />
          </div>

          <span>AI Assistant</span>

          {/* Pequeño indicador de destello para darle vida */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-300"></span>
          </span>
        </button>
      </div>

      {/* Contenedor del Perfil con Dropdown */}
      <div className="relative" ref={menuRef}>
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shrink-0">
            {currentUser ? getInitials(currentUser.name) : '??'}
          </div>

          {/* Oculto en móvil, visible en md en adelante */}
          <div className="hidden md:flex items-center gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-none">{currentUser?.name || 'Cargando...'}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">{currentUser?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Modal Dropdown (Se abre igual al tocar el avatar en móvil o hacer clic en desktop) */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}