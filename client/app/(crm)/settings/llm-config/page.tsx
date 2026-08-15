'use client';

import { useState, useEffect } from 'react';
import { Bot, Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LlmConfigPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estados del formulario
    const [provider, setProvider] = useState('openai');
    const [modelName, setModelName] = useState('gpt-4o-mini');
    const [apiKey, setApiKey] = useState('');
    const [hasExistingKey, setHasExistingKey] = useState(false);

    // Cargar la configuración actual al montar la página
    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch('/api/tenant/llm'); // Ajusta tu ruta API de fetch si es distinta
                if (res.ok) {
                    const data = await res.json();
                    console.log(data);
                    if (data && data.llmConfig) {
                        setProvider(data.llmConfig.provider || 'openai');
                        setModelName(data.llmConfig.modelName || 'gpt-4o-mini');
                        setHasExistingKey(true); // Ya hay una llave guardada
                    }
                }
            } catch (error) {
                console.error('Error al cargar la configuración de IA:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/tenant/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    modelName,
                    apiKey,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al guardar la configuración');
            }

            setMessage({ type: 'success', text: '¡Configuración de IA guardada correctamente!' });
            setHasExistingKey(true);
            setApiKey(''); // Limpiamos el campo por seguridad

            // Opcional: Redirigir de vuelta a los settings generales tras un momento
            setTimeout(() => {
                router.push('/settings');
            }, 1500);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Cabecera con botón de retorno */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Configuración de Inteligencia Artificial</h1>
                        <p className="text-sm text-slate-500">Define el proveedor y las credenciales de LLM para tu tenant.</p>
                    </div>
                </div>
                <Link
                    href="/settings"
                    className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </Link>
            </div>

            {/* Formulario principal */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                        {message.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Proveedor */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Proveedor de IA
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            <option value="openai">OpenAI</option>
                            {/* Preparado de forma agnóstica para futuros proveedores */}
                            <option value="anthropic" disabled>Anthropic (Próximamente)</option>
                        </select>
                    </div>

                    {/* Modelo */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Modelo a utilizar
                        </label>
                        <select
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            <option value="gpt-4o-mini">GPT-4o Mini (Recomendado / Rápido y económico)</option>
                            <option value="gpt-4o">GPT-4o (Máximo razonamiento y precisión)</option>
                        </select>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {hasExistingKey ? 'Actualizar API Key (Opcional)' : 'API Key personalizada'}
                        </label>
                        <input
                            type="password"
                            placeholder={hasExistingKey ? "•••••••••••••••• (Guardado - Escribe una api key nueva para cambiarla)" : "Api key"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            {hasExistingKey 
                                ? 'Ya cuentas con una clave guardada. Si dejas este espacio en blanco, se conservará la actual.' 
                                : 'Si se deja vacío, el sistema utilizará la clave global por defecto del servidor.'}
                        </p>
                    </div>

                    {/* Botón de envío */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}