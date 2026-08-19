"use client"

import { Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '../../utils/formatDate';
import { SidebarSkeleton } from './SidebarSkeleton';

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

}: ChatSidebar) {

    const { conversations, setConversations, } = useStore();

    const isLoading = conversations.length === 0;

    const getAvatarColor = (name: string) => {
        const firstLetter = name.trim()[0]?.toUpperCase() || 'A';
        const charCode = firstLetter.charCodeAt(0);
        const colors = [
            'bg-blue-100 text-blue-700 border-blue-200',
            'bg-purple-100 text-purple-700 border-purple-200',
            'bg-pink-100 text-pink-700 border-pink-200',
            'bg-indigo-100 text-indigo-700 border-indigo-200',
            'bg-teal-100 text-teal-700 border-teal-200',
            'bg-orange-100 text-orange-700 border-orange-200',
        ];
        return colors[charCode % colors.length];
    };

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
                {isLoading ? (
                    <SidebarSkeleton />
                ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectChat(conv)}
                            className={`p-4 border-b border-slate-100/80 cursor-pointer transition-all flex items-center gap-3 ${selectedChat?.id === conv.id
                                    ? 'bg-white border-l-4 border-l-indigo-500'
                                    : 'hover:bg-slate-100'
                                }`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${getAvatarColor(conv.lead.name)}`}>
                                {conv.lead.name.trim().charAt(0).toUpperCase()}
                            </div>

                            {/* Información del Chat */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className="font-semibold text-slate-800 text-sm truncate">{conv.lead.name}</span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{formatDate(conv.lastMessageAt)}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                    {conv.messages[0]?.messageText || 'Sin mensajes'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-sm text-slate-400">
                        No se encontraron conversaciones.
                    </div>
                )}
            </div>
        </div>
    )
}
