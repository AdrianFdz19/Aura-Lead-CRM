import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: "Basic",
            slug: "basic",
            price: "$29",
            description: "Ideal for independent real estate agencies.",
            features: ["Up to 50 leads/month", "WhatsApp management", "Email support"],
        },
        {
            name: "Professional",
            slug: "professional",
            price: "$79",
            description: "For growing teams.",
            features: ["Unlimited leads", "WhatsApp Business API", "Advanced dashboard", "Priority support"],
            highlight: true,
        },
        {
            name: "Enterprise",
            slug: "enterprise",
            price: "Custom",
            description: "Tailored solutions for large enterprises.",
            features: ["Everything in Professional", "External CRM integration", "Dedicated Account Manager"],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 sm:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Informative banner and quick access to demo account */}
                <div className="mb-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3">
                        Demo Mode
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Evaluating the platform</h3>
                    <p className="text-slate-600 text-sm mb-4">
                        Registrations and plans are temporarily locked. You can directly access the system using the preconfigured demo account from the login page.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
                    >
                        Go to Sign In (Demo Account) →
                    </Link>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Choose the ideal plan</h2>
                    <p className="text-lg text-slate-600">Start today and scale your real estate business with AuraCRM.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                                plan.highlight 
                                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl lg:-translate-y-2' 
                                    : 'border-slate-200/80 shadow-sm'
                            }`}
                        >
                            <div>
                                {plan.highlight && (
                                    <span className="absolute -top-3.5 left-8 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                                <div className="text-4xl font-black text-slate-900 mb-6 flex items-baseline">
                                    {plan.price}
                                    {plan.price !== "Custom" && <span className="text-base font-normal text-slate-500 ml-1">/month</span>}
                                </div>

                                <div className="border-t border-slate-100 pt-6 mb-8">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">What's included?</p>
                                    <ul className="space-y-3.5">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start text-sm text-slate-700">
                                                <span className="mr-2.5 text-blue-600 font-bold flex-shrink-0">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Locked button */}
                            <button
                                disabled
                                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 transition-all"
                            >
                                Select Plan (Locked)
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}