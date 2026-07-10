"use client"

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Bot } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '../utils/formatDate';
import { Message } from '../types/chat';

export default function ChatPage({ tenantId }: { tenantId: string }) {
    // 1. Consumimos el estado directamente del store
    const { messages: allMessages, conversations, setConversations, handleIncomingMessage } = useStore();

    // Mantenemos estados locales solo para la UI de navegación y entrada
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [inputText, setInputText] = useState('');

    // Mensajes específicos para el chat abierto
    const messages = selectedChat ? (allMessages[selectedChat.id] || []) : [];

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

    // Suscripción Pusher centralizada
    useEffect(() => {
        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusherClient.subscribe(`tenant-${tenantId}`);
        channel.bind('new-message', (data: any) => {
            handleIncomingMessage(data);
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

    // Enviar un mensaje
        const handleSendMessage = async (text: string) => {
            if (!selectedChat) return;

            // 1. Crear el objeto de mensaje "optimista"
            const tempMessage: Message = {
                id: Date.now().toString(),
                messageText: text,
                senderType: 'AGENT',
                conversationId: selectedChat.id, // <--- AÑADE ESTA LÍNEA
            };

            // 2. Actualizar UI al instante en el store (para mantener consistencia)
            // Usamos una función similar a handleIncomingMessage o un set directo
            useStore.getState().setMessages(selectedChat.id, [
                ...(allMessages[selectedChat.id] || []),
                tempMessage
            ]);

            setInputText('');

            try {
                // 3. Ejecutar la petición real
                const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
                    method: 'POST',
                    body: JSON.stringify({ messageText: text }),
                });

                if (!res.ok) throw new Error('Error al enviar');

                const savedMessage = await res.json();
                useStore.getState().replaceTempMessage(selectedChat.id, tempMessage.id, savedMessage);

                // 5. Opcional: Actualizar el preview en la lista de conversaciones
                // Esto asegura que el "lastMessage" cambie inmediatamente
                const updatedConvs = conversations.map(c =>
                    c.id === selectedChat.id
                        ? { ...c, messages: [savedMessage], lastMessageAt: new Date().toISOString() }
                        : c
                );
                setConversations(updatedConvs);

            } catch (error) {
                console.error('Error:', error);
                // Revertir: remover el mensaje temporal si falla
                const currentMessages = allMessages[selectedChat.id] || [];
                useStore.getState().setMessages(
                    selectedChat.id,
                    currentMessages.filter((msg) => msg.id !== tempMessage.id)
                );
                alert('No se pudo enviar el mensaje. Intenta de nuevo.');
            }
        };

    return (
        <div className="h-[calc(100vh-2rem)] max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden">

            {/* Columna Izquierda: Lista de chats */}
            <div className="w-1/3 bg-slate-50/50 border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-lg">Mensajes</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectChat(conv)}
                            className={`p-5 border-b border-slate-100 cursor-pointer transition-all ${selectedChat?.id === conv.id ? 'bg-white border-l-4 border-l-blue-600' : 'hover:bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-900 text-sm">{conv.lead.name}</span>
                                <span className="text-[10px] text-slate-400">{formatDate(conv.lastMessageAt)}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{conv.messages[0]?.messageText || 'Sin mensajes'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna Derecha: Chat abierto */}
            <div className="w-2/3 flex flex-col bg-slate-50/30">
                {selectedChat ? (
                    <>
                        {/* Header del Chat */}
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                                    {selectedChat.lead.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-900">{selectedChat.lead.name}</span>
                            </div>
                        </div>

                        {/* Area de Mensajes */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'AGENT' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.senderType === 'AGENT'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}>
                                        {msg.messageText}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (inputText.trim()) {
                                        handleSendMessage(inputText);
                                        setInputText('');
                                    }
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <p className="text-sm">Selecciona una conversación</p>
                    </div>
                )}
            </div>
        </div>
    );
}