import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: "Básico",
            slug: "basic",
            price: "$29",
            description: "Ideal para inmobiliarias independientes.",
            features: ["Hasta 50 leads/mes", "Gestión de WhatsApp", "Soporte vía email"],
        },
        {
            name: "Profesional",
            slug: "professional",
            price: "$79",
            description: "Para equipos en crecimiento.",
            features: ["Leads ilimitados", "WhatsApp Business API", "Dashboard avanzado", "Soporte prioritario"],
            highlight: true,
        },
        {
            name: "Enterprise",
            slug: "enterprise",
            price: "Personalizado",
            description: "Soluciones a la medida para grandes empresas.",
            features: ["Todo lo anterior", "Integración con CRM externo", "Account Manager dedicado"],
        },
    ];

    return (
        <div className="py-24 px-8 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight mb-4">Elige el plan ideal</h2>
                <p className="text-lg text-slate-600">Empieza hoy y escala tu inmobiliaria.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`border rounded-2xl p-8 flex flex-col ${plan.highlight ? 'border-blue-600 shadow-xl scale-105' : 'border-slate-200'}`}
                    >
                        {plan.highlight && <span className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Más popular</span>}
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-4xl font-bold my-6">{plan.price}<span className="text-base font-normal text-slate-500">/mes</span></p>
                        <p className="text-slate-600 mb-8 flex-grow">{plan.description}</p>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center text-sm">
                                    <span className="mr-2">✓</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                            href={`/register?plan=${plan.slug}`}
                        >
                            Seleccionar Plan
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}