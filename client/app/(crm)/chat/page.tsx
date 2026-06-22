'use client';
import { useState, useEffect } from 'react';

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
        if (!selectedChat) return; // Soluciona la flag roja de selectedChat.id

        const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ messageText: text }),
        });

        const newMessage = await res.json();
        // Agrega el nuevo mensaje a tu estado local para verlo al instante
        setMessages([...messages, newMessage]);
    };

    // 1. Cargar lista de chats al iniciar
    useEffect(() => {
        fetch('/api/conversations')
            .then(res => res.json())
            .then(data => setConversations(data));
    }, []);

    // 2. Cargar mensajes cuando se selecciona un chat
    const handleSelectChat = async (conv: Conversation) => {
        setSelectedChat(conv);
        const res = await fetch(`/api/conversations/${conv.id}/messages`);
        const data = await res.json();
        setMessages(data);
    };

    return (
        <div className="flex h-screen bg-gray-100 max-w-[1400px] mx-auto border-x border-gray-200">
            {/* Columna Izquierda: Lista de chats */}
            <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b font-bold text-lg">Chats</div>
                {conversations.map((conv, index) => (
                    <div
                        key={conv.id || index}
                        onClick={() => handleSelectChat(conv)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat?.id === conv.id ? 'bg-blue-50' : ''}`}
                    >
                        <div className="font-semibold">{conv.lead.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                            {conv.messages[0]?.messageText || 'Sin mensajes'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Columna Derecha: Chat abierto */}
            <div className="w-2/3 flex flex-col bg-[#E5DDD5]">
                {selectedChat ? (
                    <>
                        <div className="p-4 bg-white border-b font-semibold">
                            {selectedChat.lead.name}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {messages.map((msg, index) => (
                                <div key={msg.id || index} className={`p-2 rounded-lg max-w-xs ${msg.senderType === 'LEAD' ? 'bg-white self-start' : 'bg-green-200 self-end ml-auto'}`}>
                                    {msg.messageText}
                                </div>
                            ))}
                        </div>

                        {/* Input de mensaje */}
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (inputText.trim()) {
                                    handleSendMessage(inputText);
                                    setInputText('');
                                }
                            }} 
                            className="p-4 bg-white border-t flex gap-2"
                        >
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                            >
                                Enviar
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Selecciona un chat para comenzar
                    </div>
                )}
            </div>
        </div>
    );
}