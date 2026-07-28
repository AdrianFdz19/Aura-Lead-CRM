"use client"

import { Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '../../utils/formatDate';

interface ChatSidebar {
    selectedChat: any;
    handleSelectChat: (conv: any) => void;
    searchTerm: string;
    setSearchTerm: (e: any) => void;
    setActiveFilter: (param: string) => void;
    activeFilter: string;
    filteredConversations: any[],
}

export default function ChatSidebar({
    selectedChat,
    handleSelectChat,
    searchTerm,
    setSearchTerm,
    setActiveFilter,
    activeFilter,
    filteredConversations,

} : ChatSidebar) {

    const { conversations, setConversations, } = useStore();

    return (
        <div className={`w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-slate-200">
                <h2 className="font-bold text-slate-900 text-lg">Mensajes</h2>
            </div>

            {/* --- INICIO: BÚSQUEDA Y FILTROS --- */}
            <div className="p-4 space-y-3 border-b border-slate-200">
                {/* Buscador */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full outline-none"
                    />
                </div>
                {/* Filtros rápidos (Chips) */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveFilter('All')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveFilter('Unread')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeFilter === 'Unread' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        No leídos
                    </button>
                </div>
            </div>
            {/* --- FIN: BÚSQUEDA Y FILTROS --- */}

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => handleSelectChat(conv)}
                        className={`p-5 border-b border-slate-100/80 cursor-pointer transition-all ${selectedChat?.id === conv.id ? 'bg-white border-l-4 border-l-indigo-500' : 'hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-800 text-sm">{conv.lead.name}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(conv.lastMessageAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.messages[0]?.messageText || 'Sin mensajes'}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
