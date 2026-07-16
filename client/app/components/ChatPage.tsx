"use client"

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { Bot, ChevronLeft, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate } from '../utils/formatDate';
import { Message } from '../types/chat';

export default function ChatPage({ tenantId }: { tenantId: string }) {
    // 1. Consumimos el estado directamente del store
    const { messages: allMessages, conversations, setConversations, handleIncomingMessage } = useStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    // Mantenemos estados locales solo para la UI de navegación y entrada
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [inputText, setInputText] = useState('');

    // Ref para el contenedor de mensajes para poder controlar el scroll
    const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    // --- INICIO: Lógica para el scroll automático ---
    useEffect(() => {
        // Si tenemos una referencia al contenedor de mensajes, hacemos scroll hacia abajo.
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;

            // Hacemos el scroll suave para que se note la llegada de un nuevo mensaje.
            // Esto funciona tanto al cargar el chat como al recibir nuevos mensajes.
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, selectedChat]); // Se ejecuta cuando cambia el chat o cuando se actualizan los mensajes.
    // --- FIN: Lógica para el scroll automático ---

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

    const suggestResponse = async () => {
        const lastMsgIndex: number = messages.length - 1;
        const { conversationId, senderType, messageText } = messages[lastMsgIndex];

        if (messages.length === 0) return;
        setIsGenerating(true);

        try {
            const body = {
                conversationId,
                senderType,
                messageText
            }
            const res = await fetch(`/api/chat/suggest-response`, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                setAiResponse(data.reply);
                console.log(`Recibido con exito. `, data);
            } else {
                console.log(`Fallo del cliente.`)
            }
        } catch (err) {
            console.error(`Fallo del servidor: `, err);
        } finally {
            setIsGenerating(false);
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
            <div className={`w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="font-bold text-slate-900 text-lg">Mensajes</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
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

            {/* COLUMNA DERECHA: Chat abierto 
                - En móvil: Se oculta si NO hay chat seleccionado.
                - En escritorio (md): Siempre visible.
            */}

            <div className={`flex flex-col bg-slate-100/70 overflow-hidden 
                w-full          // En móvil siempre ocupa el 100%
                md:w-2/3        // En escritorio (md) ocupa el 66%
                ${selectedChat ? 'flex' : 'hidden md:flex'} // Lógica de visibilidad
            `}>
                {selectedChat ? (
                    <>
                        {/* Header del Chat */}
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Botón "Atrás" para móvil */}
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden p-1 -ml-2 text-slate-600"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                    {selectedChat.lead.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-900">{selectedChat.lead.name}</span>
                            </div>
                        </div>

                        {/* Area de Mensajes */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-8 space-y-4"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'AGENT' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-md ${msg.senderType === 'AGENT'
                                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none'
                                        }`}>
                                        {msg.messageText}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex-none p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200/80">
                            {/* Contenedor de la Sugerencia IA (si existe) */}
                            {aiResponse && (
                                <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200/50 rounded-xl flex items-start justify-between animate-in fade-in slide-in-from-bottom-2">
                                    <div className="text-xs text-indigo-900 font-medium">
                                        <span className="block font-bold mb-1">Sugerencia IA:</span>
                                        {aiResponse}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setInputText(aiResponse); setAiResponse(null); }} className="text-indigo-600 hover:text-indigo-800 p-1 font-bold">
                                            ✓
                                        </button>
                                        <button onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-red-500 p-1 font-bold">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={(e) => { e.preventDefault(); if (inputText.trim()) { handleSendMessage(inputText); setInputText(''); } }} className="flex gap-2">
                                {/* Botón IA con Tooltip/Loading */}
                                <button
                                    type="button"
                                    disabled={isGenerating}
                                    onClick={suggestResponse}
                                    title="Sugerir respuesta con IA"
                                    className="p-2.5 bg-indigo-50 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    ) : (
                                        <Sparkles size={20} />
                                    )}
                                </button>

                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-slate-100 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                                />

                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Pantalla vacía (solo se ve en escritorio) */
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 gap-2">
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