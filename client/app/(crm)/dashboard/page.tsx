import PropertyForm from "@/app/components/PropertyForm";
import { getSession } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getSession ();

  // Asegúrate de que exista la sesión antes de renderizar
  if (!session) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bienvenido al CRM Inmobiliario</h1>
      <p className="mt-2 text-gray-600">Tu suscripción está activa.</p>

      <PropertyForm tenantId={session.tenantId} />
    </div>
  );
}
