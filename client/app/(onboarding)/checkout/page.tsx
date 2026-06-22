
import { redirect } from 'next/navigation';
import { createCheckoutSession, getSubscriptionStatus } from '@/lib/actions'; // Asegúrate de importar la acción

export default async function CheckoutPage() {
    // 1. Obtenemos la suscripción. Si getSubscriptionStatus() devuelve null, 
    // significa que no hay sesión válida.
    const subscription = await getSubscriptionStatus();

    // 2. Si no hay suscripción, redirigimos a login. 
    // Si ya está activa, redirigimos al dashboard.
    if (!subscription) redirect('/login');
    if (subscription.status === 'active') redirect('/dashboard');

    // 3. Ya tenemos la suscripción validada y lista
    const initiatePayment = createCheckoutSession.bind(
        null,
        subscription.plan as 'basic' | 'professional' | 'enterprise'
    );

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <h1 className="text-2xl font-bold">Resumen de tu suscripción</h1>

            <div className="mt-6 p-6 border rounded-lg shadow-sm">
                <p className="text-gray-600">Plan seleccionado:</p>
                <p className="text-xl font-bold uppercase">{subscription.plan}</p>
                <p className="mt-4 text-sm text-gray-500">
                    Al confirmar, serás redirigido a Stripe para completar tu pago de forma segura.
                </p>
            </div>

            <form action={initiatePayment} className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Pagar ahora con Stripe
                </button>
            </form>
        </div>
    );
}