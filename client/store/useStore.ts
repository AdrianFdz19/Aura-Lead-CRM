import { create } from 'zustand';
import { Lead } from '@/app/types/lead';
import { Message } from '@/app/types/chat';

// 1. Definimos el estado inicial para poder reutilizarlo
const initialState = {
  leads: [],
  messages: {},
  conversations: [],
};

interface AppStore {
  leads: Lead[];
  messages: Record<string, Message[]>;
  conversations: any[];
  
  // Acciones
  setLeads: (leads: Lead[]) => void;
  setMessages: (conversationId: string, msgs: Message[]) => void;
  setConversations: (convs: any[]) => void;
  handleIncomingMessage: (payload: { message: Message, conversation: any, lead: any }) => void;
  replaceTempMessage: (conversationId: string, tempId: string, finalMessage: Message) => void;
  removeLead: (leadId: string) => void;
  
  // NUEVA ACCIÓN DE LIMPIEZA
  reset: () => void; 
}

export const useStore = create<AppStore>((set) => ({
  ...initialState, // Usamos el estado inicial aquí

  setConversations: (conversations) => set({ conversations }),
  setLeads: (leads) => set({ leads }),
  setMessages: (conversationId, msgs) => set((state) => ({
    messages: { ...state.messages, [conversationId]: msgs }
  })),

  // Acción de reseteo: vuelve todo a los valores definidos en initialState
  reset: () => set(initialState),

  handleIncomingMessage: (payload) => set((state) => {
    const { message, conversation, lead } = payload;

    const leadExists = state.leads.some((l) => l.id === lead.id);
    const updatedLeads = leadExists
      ? state.leads.map((l) => l.id === lead.id ? { ...l, lastMessage: message.messageText } : l)
      : [...state.leads, { lastMessage: message.messageText, status: lead.status || 'nuevo', ...lead }];

    let updatedConversations;
    const conversationExists = state.conversations.some(c => c.id === conversation.id);

    if (conversationExists) {
      const otherConversations = state.conversations.filter(c => c.id !== conversation.id);
      const existingConv = state.conversations.find(c => c.id === conversation.id)!;
      const updatedConv = {
        ...existingConv,
        lastMessageAt: conversation.lastMessageAt,
        messages: [message],
      };
      updatedConversations = [updatedConv, ...otherConversations];
    } else {
      const newConversation = {
        id: conversation.id,
        lastMessageAt: conversation.lastMessageAt,
        lead: { name: lead.name, waId: lead.waId },
        messages: [message],
      };
      updatedConversations = [newConversation, ...state.conversations];
    }

    const currentChatMessages = state.messages[conversation.id] || [];
    const messageAlreadyExists = currentChatMessages.some((msg) => msg.id === message.id);

    const updatedMessages = {
      ...state.messages,
      [conversation.id]: messageAlreadyExists
        ? currentChatMessages
        : [...currentChatMessages, message]
    };

    return { 
      leads: updatedLeads, 
      messages: updatedMessages, 
      conversations: updatedConversations 
    };
  }),

  replaceTempMessage: (conversationId, tempId, finalMessage) => set((state) => {
    const currentMessages = state.messages[conversationId] || [];
    const updatedMessages = currentMessages.map(msg => msg.id === tempId ? finalMessage : msg);

    return {
      messages: { ...state.messages, [conversationId]: updatedMessages }
    };
  }),

  removeLead: (leadId) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== leadId)
  })),
}));