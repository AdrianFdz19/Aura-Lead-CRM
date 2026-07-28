"use client"

import { useState, useEffect, useMemo } from 'react';
import Pusher from 'pusher-js';
import { useStore } from '@/store/useStore';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

export default function ChatPage({ tenantId }: { tenantId: string }) {
    // 1. Consumimos el estado directamente del store
    const {
        messages: allMessages,
        conversations,
        setConversations,
        handleIncomingMessage,
        updateMessageStatus
    } = useStore();

    // Mantenemos estados locales solo para la UI de navegación y entrada
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unread'

    useEffect(() => {
        // Solo cargamos si el store está vacío
        if (conversations.length === 0) {
            fetch('/api/conversations')
                .then(res => res.json())
                .then(data => {
                    console.log("Datos recibidos de API:", data);
                    setConversations(data); // <--- ESTO GUARDARÁ LOS DATOS EN EL STORE
                });
        }
    }, [conversations.length, setConversations]);

    // Memoizamos las conversaciones filtradas para optimizar el renderizado
    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            // Filtro de búsqueda por nombre
            const searchMatch = conv.lead.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro de no leídos (asumiendo que si el último mensaje es del LEAD, está "no leído" por el agente)
            const lastMessage = conv.messages?.[0];
            const isUnread = lastMessage?.senderType === 'LEAD';
            const filterMatch = activeFilter === 'All' || (activeFilter === 'Unread' && isUnread);

            return searchMatch && filterMatch;
        });
    }, [conversations, searchTerm, activeFilter]);



    // Suscripción Pusher centralizada
    useEffect(() => {
        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusherClient.subscribe(`tenant-${tenantId}`);
        channel.bind('new-message', (data: any) => {
            handleIncomingMessage(data);
        });

        // NUEVO: Evento para actualizar los checks de leído/entregado
        channel.bind('message-status-update', (data: { messageId: string; conversationId: string; status: 'sent' | 'delivered' | 'read' }) => {
            updateMessageStatus(data.conversationId, data.messageId, data.status);
        });

        return () => {
            pusherClient.unsubscribe(`tenant-${tenantId}`);
            pusherClient.disconnect();
        };
    }, [handleIncomingMessage, tenantId]);

    // 2. Cargar mensajes cuando se selecciona un chat
    const handleSelectChat = async (conv: any) => {
        setSelectedChat(conv);
        // Si no tenemos los mensajes en el store, los cargamos
        if (!allMessages[conv.id]) {
            const res = await fetch(`/api/conversations/${conv.id}/messages`);
            const data = await res.json();
            // Necesitarías una acción setMessages en tu store
            useStore.getState().setMessages(conv.id, data);
        }
    };

    return (
        // Eliminamos max-w-[1400px] y mx-auto para que ocupe todo el espacio disponible.
        <div className="h-[calc(100vh-128px)] md:h-full bg-white rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden"> {/* Mantenemos el fondo general blanco */}

            {/* COLUMNA IZQUIERDA: Lista de chats 
                - En móvil: Se oculta si hay un chat seleccionado (selectedChat es true).
                - En escritorio (md): Siempre visible (w-1/3).
            */}
            {/* Columna Izquierda: Lista de chats */}
            <ChatSidebar
                selectedChat={selectedChat}
                handleSelectChat={handleSelectChat}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setActiveFilter={setActiveFilter}
                activeFilter={activeFilter}
                filteredConversations={filteredConversations}
            />

            {/* COLUMNA DERECHA: Chat abierto 
                - En móvil: Se oculta si NO hay chat seleccionado.
                - En escritorio (md): Siempre visible.
            */}
            <ChatWindow
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
            />
        </div>
    );
}