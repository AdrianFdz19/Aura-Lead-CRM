

export interface Message {
  id: string;
  messageText: string;
  senderType: 'LEAD' | 'AGENT' | 'SYSTEM';
  conversationId: string;
}