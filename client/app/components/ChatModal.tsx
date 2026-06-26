// components/ChatModal.tsx
"use client";
import { useState } from "react";

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Message = {
    id: string;      // Un identificador único (puedes usar Date.now().toString())
    role: 'user' | 'assistant'; // Quién envió el mensaje
    content: string; // El texto del mensaje
    createdAt: Date; // Para ordenar los mensajes
};

// Lista de mensajes de simulación (Mocks)
const initialMessages: Message[] = [
    { id: '1', role: 'assistant', content: 'Hola, soy tu asistente inmobiliario. ¿En qué puedo ayudarte hoy?', createdAt: new Date() },
];

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, createdAt: new Date() };
        const updatedMessages = [...messages, userMessage]; // El historial actualizado
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        // Llamada al endpoint que acabamos de crear
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({  
                message: input,
                history: updatedMessages 
            })
        });

        const data = await response.json();

        if (data.reply) {
            const aiMessage: Message = { id: Date.now().toString(), role: 'assistant', content: data.reply, createdAt: new Date() };
            setMessages(prev => [...prev, aiMessage]);
        }

        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-gray-700">Asistente IA</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl">×</button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((m) => (
                        <div key={m.id} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                            {m.content}
                        </div>
                    ))}
                    {isLoading && <p className="text-xs text-gray-400">Pensando...</p>}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pregunta sobre propiedades..."
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
}