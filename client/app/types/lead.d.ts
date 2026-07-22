

export interface Lead {
  id: string;
  name: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  lastMessage: string; 
  priority: 'hot' | 'warm' | 'cold'; 
  AssignedToId?: string;
}