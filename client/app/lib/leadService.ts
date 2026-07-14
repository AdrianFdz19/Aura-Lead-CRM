// lib/leadService.ts

import prisma from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export const leadService = {
    async updateStatusByConversation(conversationId: string, newStatus: string) {
        // 1. Buscamos la relación
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            // IMPORTANTE: Usa los nombres EXACTOS de los campos como aparecen en tu schema.prisma
            select: {
                leadId: true,    // Si en el schema dice 'lead_id'
                tenantId: true   // Si en el schema dice 'tenant_id'
            }
        });

        if (!conversation) throw new Error("Conversación no encontrada");

        // 2. Realizamos la actualización
        const updatedLead = await prisma.lead.update({
            where: { id: conversation.leadId }, // Usa el valor extraído
            data: { status: newStatus }
        });

        // 3. Notificamos vía Pusher
        await pusher.trigger(
            `tenant-${conversation.tenant_id}`,
            "lead-updated",
            { leadId: conversation.leadId, newStatus }
        );

        return updatedLead;
    }
};