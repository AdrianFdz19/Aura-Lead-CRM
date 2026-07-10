import { create } from 'zustand';

// Importamos las interfaces que ya tienes
import { Lead } from '@/app/components/LeadCard'; 

interface Message {
  id: string;
  messageText: string;
  senderType: 'LEAD' | 'AGENT' | 'SYSTEM';
  conversationId: string; // Importante para saber a quién pertenece
}

interface AppStore {
  leads: Lead[];
  messages: Record<string, Message[]>; // Diccionario: { [conversationId]: Message[] }
  
  // Acciones
  setLeads: (leads: Lead[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateLeadLastInteraction: (leadId: string, newText: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  leads: [],
  messages: {},

  setLeads: (leads) => set({ leads }),

  addMessage: (conversationId, message) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message]
      }
    })),

  updateLeadLastInteraction: (leadId, newText) =>
    set((state) => ({
      leads: state.leads.map((l) => 
        l.id === leadId ? { ...l, lastInteraction: newText } : l
      )
    })),
}));