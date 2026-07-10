import { create } from 'zustand';
import Pusher from 'pusher-js';

export const useStore = create((set, get) => ({
  leads: [],
  messages: {}, // Diccionario: { conversationId: Message[] }

  // Acción para agregar mensaje y actualizar Kanban
  handleIncomingMessage: (conversationId: string, leadId: string, newMessage: any) => {
    // 1. Actualizar mensajes del chat
    set((state: any) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), newMessage]
      }
    }));

    // 2. Actualizar el Kanban directamente
    set((state: any) => ({
      leads: state.leads.map((lead: any) => 
        lead.id === leadId 
          ? { ...lead, lastInteraction: newMessage.messageText } 
          : lead
      )
    }));
  },
  
  // Acciones para setear estado inicial
  setLeads: (leads: any) => set({ leads }),
  setMessages: (convId: string, msgs: any[]) => set((state: any) => ({
    messages: { ...state.messages, [convId]: msgs }
  }))
}));