// app/(crm)/layout.tsx (Server Component)
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { WhatsAppGuard } from "../components/WhatsappGuard";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { getPublicUrl } from "@/lib/s3";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login");

  // Buscamos la suscripción vinculada al tenant del usuario actual
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: session.tenantId },
    select: { status: true }
  });

  // 1. Obtener el perfil completo del usuario usando el ID de la sesión
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    // Selecciona solo los campos que necesitas en el cliente
    select: {
      id: true, name: true, avatar: true, email: true, phone: true, role: true, tenantId: true, isActive: true,
      tenant: { // <-- Añadimos esto para obtener el nombre del tenant
        select: { name: true }
      }
    }
  });

  // Si por alguna razón el usuario no existe en la BD pero tiene una sesión, lo redirigimos
  if (!user) redirect("/login");

  // Si no existe suscripción o el status NO es 'active', redirigimos
  // Esto incluye el caso de 'payment_pending' o si la BD devolvió null
  if (subscription?.status !== 'active') {
    redirect("/checkout");
  }

  // 2. Obtener la lista del equipo desde la BD
  const rawTeam = await prisma.user.findMany({
    where: { tenantId: session.tenantId },
    select: { 
      id: true, 
      name: true, 
      avatar: true, 
      email: true, 
      phone: true, 
      role: true, 
      tenantId: true, 
      isActive: true,
      _count: {
        select: { assignedLeads: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Procesar los avatares de forma segura en paralelo (igual que en tu ruta GET)
  const team = await Promise.all(
    rawTeam.map(async (member) => {
      let avatarUrl = null;

      if (member.avatar) {
        try {
          avatarUrl = await getPublicUrl(member.avatar);
        } catch (err) {
          console.error(`Error getting public url for user ${member.id}:`, err);
        }
      }

      return {
        ...member,
        avatar: avatarUrl,
        leadsCount: member._count.assignedLeads,
      };
    })
  );

  return (
    <ClientLayoutWrapper user={user} initialTeam={team}>
      <WhatsAppGuard>
        {children}
      </WhatsAppGuard>
    </ClientLayoutWrapper>
  );
}
