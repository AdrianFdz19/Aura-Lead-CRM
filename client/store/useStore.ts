import { create } from 'zustand';
import { Lead } from '@/app/types/lead';
import { Message } from '@/app/types/chat';
import { User, TeamUser } from '@/app/types/user';

// 1. Definimos el estado inicial para poder reutilizarlo
const initialState = {
  leads: [],
  messages: {},
  conversations: [],
  currentUser: undefined, // Lo inicializamos como undefined, se hidratará al cargar
  team: [], // El equipo también se puede cargar desde la API
};

interface AppStore {
  leads: Lead[];
  messages: Record<string, Message[]>;
  conversations: any[];
  currentUser?: User;
  team: TeamUser[];

  // Acciones
  setLeads: (leads: Lead[]) => void;
  setMessages: (conversationId: string, msgs: Message[]) => void;

  setConversations: (convs: any[]) => void;
  setCurrentUser: (user: User) => void;
  setInitialTeam: ( initialTeam: TeamUser[] ) => void;
  removeAgent: (agentId: string) => void;
  addAgent: (newAgent: TeamUser) => void;
  updateAgent: (updatedAgent: TeamUser) => void;

  handleIncomingMessage: (payload: { message: Message, conversation: any, lead: any }) => void;
  replaceTempMessage: (conversationId: string, tempId: string, finalMessage: Message) => void;

  updateLeadStatus: (leadId: string, newStatus: string) => void;
  assignAgentToLead: (leadId: string, agentId: string) => void;
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

  // Nueva acción para hidratar el usuario
  setCurrentUser: (user) => set({ currentUser: user }),

  setInitialTeam: (initialTeam) => set({ team: initialTeam }),

  removeAgent: (agentId) => set((state) => ({
    team: state.team.filter((member) => member.id !== agentId)
  })),

  // Acción para añadir un nuevo agente al principio de la lista
  addAgent: (newAgent) => set((state) => ({
    team: [newAgent, ...state.team]
  })),

  // Acción para actualizar un agente existente en la lista
  updateAgent: (updatedAgent) => set((state) => ({
    team: state.team.map((member) => member.id === updatedAgent.id ? updatedAgent : member)
  })),

  // Acción de reseteo: vuelve todo a los valores definidos en initialState
  reset: () => set(initialState),

  handleIncomingMessage: (payload) => set((state) => {
    const { message, conversation, lead } = payload;

    const leadExists = state.leads.some((l) => l.id === lead.id);
    const updatedLeads = leadExists
      ? state.leads.map((l) => l.id === lead.id ? { ...l, lastMessage: message.messageText } : l)
      : [...state.leads, { lastMessage: message.messageText, status: lead.status || 'NEW', ...lead }];

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

  // Update Lead Status
  updateLeadStatus: (leadId: string, newStatus: string) => {
    console.log(leadId, newStatus);
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ),
    }));

    // Llamada al backend
    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  },

  // Asignar un agente a un Lead usando assignedToId
  assignAgentToLead: (leadId, agentId) => {
    set((state) => {
      const updatedLeads = state.leads.map(lead =>
        lead.id === leadId ? { ...lead, assignedToId: agentId } : lead
      );
      return { leads: updatedLeads };
    });

    // Llamada al backend utilizando la columna correcta
    fetch(`/api/leads/${leadId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: agentId }),
    });
  },

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