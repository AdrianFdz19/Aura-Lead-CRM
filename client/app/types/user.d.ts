export type User = {
    id: string;
    name: string;
    avatar?: string | null;
    email: string;
    phone?: string | null;
    role: 'ADMIN' | 'AGENT';
    tenantId?: string;
    isActive: boolean;
    tenant: {
        name: string;
    };
}

export type TeamUser = {
    id: string;
    name: string;
    avatar?: string | null;
    email: string;
    phone?: string | null;
    role: 'ADMIN' | 'AGENT';
    tenantId?: string;
    isActive: boolean;
    leadsCount: number;
}