// app/(crm)/layout.tsx (Server Component)
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CrmHeader from "../components/CrmHeader";
import { WhatsAppGuard } from "../components/WhatsappGuard";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login");

  // Buscamos la suscripción vinculada al tenant del usuario actual
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId: session.tenantId },
    select: { status: true }
  });

  // Si no existe suscripción o el status NO es 'active', redirigimos
  // Esto incluye el caso de 'payment_pending' o si la BD devolvió null
  if (subscription?.status !== 'active') {
    redirect("/checkout");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CrmHeader />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <WhatsAppGuard>
          {children}
        </WhatsAppGuard>
      </main>
    </div>
  );
}

