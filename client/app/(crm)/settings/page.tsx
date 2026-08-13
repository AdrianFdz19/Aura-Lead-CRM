'use client';
import { useEffect, useState } from 'react';
import { Building, Key, Bot, AlertTriangle, Save, ShieldCheck } from 'lucide-react';
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

					{/* 2. Configuración de OpenAI / Asistente IA (Bring Your Own Key) */}
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
						<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
							<div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
								<Bot className="w-5 h-5" />
							</div>
							<div>
								<h2 className="font-bold text-slate-900">Inteligencia Artificial (OpenAI)</h2>
								<p className="text-xs text-slate-400">Configura tu propia API Key y modelo preferido para los agentes virtuales</p>
							</div>
						</div>

						<form onSubmit={handleSaveAI} className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
									OpenAI API Key personalizada
								</label>
								<input
									type="password"
									placeholder="sk-proj-..."
									value={openaiKey}
									onChange={(e) => setOpenaiKey(e.target.value)}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2-purple-500 transition-all"
								/>
								<p className="text-[11px] text-slate-400 mt-1">Si se deja vacío, el sistema utilizará la clave global por defecto del servidor.</p>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
									Modelo de OpenAI a utilizar
								</label>
								<select
									value={selectedModel}
									onChange={(e) => setSelectedModel(e.target.value)}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
								>
									<option value="gpt-4o-mini">GPT-4o Mini (Recomendado / Rápido y económico)</option>
									<option value="gpt-4o">GPT-4o (Máximo razonamiento y precisión)</option>
								</select>
							</div>

							<div className="flex justify-end">
								<button
									type="submit"
									className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
								>
									<Save className="w-4 h-4" /> Actualizar IA
								</button>
							</div>
						</form>
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
						<p className="text-xs text-slate-500">
							La línea oficial de Meta se encuentra vinculada correctamente para este tenant. Las webhooks están operando con normalidad.
						</p>
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