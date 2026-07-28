"use client"

import { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, ChevronLeft, Sparkles, Check, CheckCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Message } from '../../types/chat';

interface ChatWindow {
    selectedChat: any,
    setSelectedChat: (e: any) => void;
};

export default function ChatWindow({
    selectedChat,
    setSelectedChat,

}: ChatWindow) {

    const { messages: allMessages, sendMessage } = useStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');

    // Mensajes específicos para el chat abierto
    const messages = selectedChat ? (allMessages[selectedChat.id] || []) : [];

    // Ref para el contenedor de mensajes para poder controlar el scroll
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // --- INICIO: Lógica para el scroll automático ---
    useEffect(() => {
        // Si tenemos una referencia al contenedor de mensajes, hacemos scroll hacia abajo.
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;

            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, selectedChat]);

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

    // Enviar un mensaje
    const handleSendMessage = async (text: string) => {
        if (!selectedChat || !text.trim()) return;
        
        const messageToSend = text;
        setInputText('');
        // Ahora simplemente llamamos a la acción del store
        await sendMessage(selectedChat.id, messageToSend);
    };

    return (
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
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderType === 'AGENT' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-md ${msg.senderType === 'AGENT'
                                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-none'
                                    : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none'
                                    }`}>
                                    <div className="pr-8"> {/* Espacio para el icono y la hora */}
                                        {msg.messageText}
                                    </div>
                                    {/* --- INICIO: Iconos de estado del mensaje (Mockup) --- */}
                                    {msg.senderType === 'AGENT' && (
                                        <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
                                            {(() => {
                                                switch (msg.status) {
                                                    case 'read':
                                                        return <CheckCheck size={16} className="text-sky-300" />;
                                                    case 'delivered':
                                                        return <CheckCheck size={16} className="text-white/70" />;
                                                    case 'sent':
                                                        return <Check size={16} className="text-white/70" />;
                                                    default:
                                                        // Estado por defecto o mientras se envía (antes de tener 'sent')
                                                        return <Check size={16} className="text-white/40" />;
                                                }
                                            })()}
                                        </div>
                                    )}
                                    {/* --- FIN: Iconos de estado del mensaje --- */}
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

                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="flex gap-2">
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
    )
}
