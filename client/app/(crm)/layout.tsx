// app/(crm)/layout.tsx (Server Component)
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { WhatsAppGuard } from "../components/WhatsappGuard";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

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
      id: true, name: true, email: true, role: true, avatar: true, isActive: true,
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

  return (
    <ClientLayoutWrapper user={user}>
      <WhatsAppGuard>
        {children}
      </WhatsAppGuard>
    </ClientLayoutWrapper>
  );
}
