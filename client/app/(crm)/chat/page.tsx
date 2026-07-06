'use client';
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Bot } from 'lucide-react';

interface Message {
    id: string;
    messageText: string;
    senderType: 'LEAD' | 'AGENT'; // Ajusta según tus enums
}

interface Lead {
    id: string;
    name: string;
}

interface Conversation {
    id: string;
    lead: Lead;
    messages: Message[];
    lastMessageAt: string;
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');

    const handleSendMessage = async (text: string) => {
        if (!selectedChat) return;

        // 1. Crear el objeto de mensaje "optimista" (temporal)
        // Usamos un ID temporal (ej. timestamp) para que React no se queje
        const tempMessage: Message = {
            id: Date.now().toString(),
            messageText: text,
            senderType: 'AGENT', // O el tipo correcto para ti
        };

        // 2. Actualizar UI al instante
        setMessages((prev) => [...prev, tempMessage]);
        setInputText(''); // Limpiar el input inmediatamente

        try {
            // 3. Ejecutar la petición real en segundo plano
            const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({ messageText: text }),
            });

            if (!res.ok) throw new Error('Error al enviar');

            const savedMessage = await res.json();

            // 4. Reemplazar el mensaje temporal por el real (con el ID de la BD)
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempMessage.id ? savedMessage : msg))
            );
        } catch (error) {
            console.error('Error:', error);
            // Opcional: remover el mensaje o mostrar un aviso de error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
            alert('No se pudo enviar el mensaje. Intenta de nuevo.');
        }
    };

    // 1. Cargar lista de chats al iniciar
    useEffect(() => {
        fetch('/api/conversations')
            .then(res => res.json())
            .then(data => setConversations(data));
    }, []);

    useEffect(() => {
        // Si no hay chat seleccionado, no hacemos nada
        if (!selectedChat) return;

        // Inicializar Pusher
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        // Suscribirse al canal específico de esta conversación
        const channel = pusher.subscribe(`chat-${selectedChat.id}`);

        // Escuchar el evento que definimos en el backend
        channel.bind("new-message", (newMessage: Message) => {
            setMessages((prev) => [...prev, newMessage]);

            // Auto-scroll al final del chat
            setTimeout(() => {
                const chatContainer = document.querySelector('.overflow-y-auto.p-4');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 100);
        });

        // Cleanup: Se ejecuta cuando cambia selectedChat o el componente se desmonta
        return () => {
            pusher.unsubscribe(`chat-${selectedChat.id}`);
            pusher.disconnect();
        };
    }, [selectedChat?.id]); // ESTA ES LA CLAVE: se vuelve a ejecutar al cambiar de chat

    // 2. Cargar mensajes cuando se selecciona un chat
    const handleSelectChat = async (conv: Conversation) => {
        setSelectedChat(conv);
        const res = await fetch(`/api/conversations/${conv.id}/messages`);
        const data = await res.json();
        setMessages(data);
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
                                <span className="text-[10px] text-slate-400">12:30 PM</span>
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