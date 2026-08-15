'use client';
import { useEffect, useState } from 'react';
import { Building, Key, Bot, AlertTriangle, Save, ShieldCheck, Link, ExternalLink, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function TenantSettings() {
	const router = useRouter();
	// Estados locales simulados para el formulario
	const [loading, setLoading] = useState(true);
	const [tenantName, setTenantName] = useState('Inmobiliaria Ejemplo S.A.');
	const [openaiKey, setOpenaiKey] = useState('');
	const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
	const [whatsappStatus, setWhatsappStatus] = useState(true);
	const [llmProvider, setLlmProvider] = useState('');
	const [llmModel, setLlmModel] = useState('');

	// Estados globales simulados (pueden provenir de un store o contexto) 
	const currentUser = useStore((state) => state.currentUser);

	if (currentUser?.role !== 'ADMIN') {
		return (
			<div className="max-w-[1400px] mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
				<div className="p-3 rounded-full bg-red-50 text-red-600">
					<AlertTriangle className="w-8 h-8" />
				</div>
				<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Acceso Restringido</h1>
				<p className="text-sm text-slate-500 max-w-md">
					Esta sección está reservada exclusivamente para administradores de la organización. Si necesitas modificar estos ajustes, contacta al dueño de la cuenta.
				</p>
				<button
					onClick={() => router.push('/dashboard')}
					className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
				>
					Volver al Dashboard
				</button>
			</div>
		);
	}

	// Traer la informacion real del tenant desde la API al montar el componente 
	useEffect(() => {
		const fetchTenantData = async () => {
			try {
				// Simulación de llamada a la API para obtener datos del tenant
				const response = await fetch('/api/tenant'); // Endpoint simulado

				if (!response.ok) throw new Error('Error al obtener datos del tenant');

				const data = await response.json();

				console.log('Datos del tenant obtenidos:', data);
				setTenantName(data.name);
				setOpenaiKey('');
				setSelectedModel('gpt-4o-mini');
				setWhatsappStatus(data.whatsappConnected || false);
				setLlmProvider(data.llmConfig?.provider || '');
				setLlmModel(data.llmConfig?.modelName || '');
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchTenantData();
	}, []);

	const handleSaveGeneral = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Lógica para guardar nombre del tenant
		console.log('Guardando tenant:', tenantName);
	};

	const handleSaveAI = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Lógica para guardar credenciales de OpenAI por tenant
		console.log('Guardando IA:', { openaiKey, selectedModel });
	};

	return (
		<div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
			{/* Header de la página */}
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración de la Organización</h1>
				<p className="text-sm text-slate-500">Administra la identidad de tu tenant, las integraciones de IA y las credenciales de servicio.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

				{/* Columna Izquierda / Principal (2 columnas en desktop): General e Integraciones de IA */}
				<div className="lg:col-span-2 space-y-6">

					{/* 1. Información General del Tenant */}
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
						<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
							<div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
								<Building className="w-5 h-5" />
							</div>
							<div>
								<h2 className="font-bold text-slate-900">Información del Tenant</h2>
								<p className="text-xs text-slate-400">Nombre comercial y datos generales de la empresa</p>
							</div>
						</div>

						<form onSubmit={handleSaveGeneral} className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
									Nombre de la Inmobiliaria / Empresa
								</label>
								<input
									type="text"
									value={tenantName}
									onChange={(e) => setTenantName(e.target.value)}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								/>
							</div>
							<div className="flex justify-end">
								<button
									type="submit"
									className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
								>
									<Save className="w-4 h-4" /> Guardar Cambios
								</button>
							</div>
						</form>
					</div>

					{/* Tarjeta de Estatus de IA (Agnóstica) */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`p-2.5 rounded-xl ${llmModel ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
									<Bot className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-base font-semibold text-slate-800">Modelo de Inteligencia Artificial</h3>
									<p className="text-xs text-slate-500">
										{llmModel
											? 'Configuración de LLM activa para el procesamiento de mensajes.'
											: 'Utilizando la configuración global por defecto del servidor.'}
									</p>
								</div>
							</div>

							{/* Badge de estatus */}
							<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${llmModel ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
								}`}>
								{llmModel ? 'Configurado' : 'Predeterminado'}
							</span>
						</div>

						{/* Detalles si están configurados */}
						{llmModel ? (
							<div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proveedor</span>
									<span className="font-medium text-slate-700 capitalize">{llmProvider}</span>
								</div>
								<div>
									<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modelo</span>
									<span className="font-medium text-slate-700">{llmModel}</span>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-500 text-xs">
								<AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
								<span>No hay un proveedor personalizado registrado. El sistema opera con los parámetros base.</span>
							</div>
						)}

						{/* Botón de redirección hacia /settings/llm-config */}
						<div className="flex justify-end pt-2">
							<button
								onClick={() => router.push('/settings/llm-config')}
								className="w-full py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
								Administrar Configuración de IA
							</button>
						</div>
					</div>

				</div>

				{/* Columna Derecha (1 columna en desktop): Estado de integraciones y Zona de Peligro */}
				<div className="space-y-6">

					{/* Estado de WhatsApp / Meta */}
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
									<ShieldCheck className="w-5 h-5" />
								</div>
								<h3 className="font-bold text-slate-900 text-sm">WhatsApp Business</h3>
							</div>
							<span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${whatsappStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
								{whatsappStatus ? 'Conectado' : 'Desconectado'}
							</span>
						</div>
						{whatsappStatus ? (
							<p className="text-xs text-slate-500">
								La línea oficial de Meta se encuentra vinculada correctamente para este tenant. Las webhooks están operando con normalidad.
							</p>
						) : (
							<p className="text-xs text-slate-500">
								Aún no se ha vinculado una línea oficial de Meta. Configura tus credenciales para habilitar las webhooks y la mensajería.
							</p>
						)}
						<button
							onClick={() => router.push('/settings/whatsapp')}
							className="w-full py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
							Gestionar credenciales Meta
						</button>
					</div>

					{/* Zona de Peligro (Danger Zone) */}
					<div className="bg-red-50/40 p-6 rounded-2xl shadow-sm border border-red-100 space-y-4">
						<div className="flex items-center gap-3 pb-4 border-b border-red-100">
							<div className="p-2.5 rounded-xl bg-red-100 text-red-600">
								<AlertTriangle className="w-5 h-5" />
							</div>
							<div>
								<h2 className="font-bold text-red-900 text-sm">Zona de Peligro</h2>
								<p className="text-[11px] text-red-500">Acciones irreversibles sobre el tenant</p>
							</div>
						</div>
						<p className="text-xs text-red-700/80 leading-relaxed">
							Eliminar este tenant borrará permanentemente todas las propiedades asociadas, leads, historiales de chat de WhatsApp y configuraciones.
						</p>
						<button
							type="button"
							className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
						>
							Eliminar Organización
						</button>
					</div>

				</div>

			</div>
		</div>
	);
}