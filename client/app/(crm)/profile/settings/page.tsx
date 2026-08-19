// app/profile/settings/page.tsx 
"use client";
import { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Mail, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

// Función auxiliar opcional para generar un color consistente basado en el nombre (si no la tienes ya global)
function getAvatarColor(name: string) {
    const colors = [
        'bg-blue-500 text-white',
        'bg-emerald-500 text-white',
        'bg-amber-500 text-white',
        'bg-purple-500 text-white',
        'bg-rose-500 text-white',
        'bg-indigo-500 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Función para obtener las iniciales
function getInitials(name: string) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export default function ProfileSettingsPage() {
    const { currentUser } = useStore((state) => state);

    const isDemoMode = currentUser?.tenantId === process.env.NEXT_PUBLIC_DEMO_TENANT_ID;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const user = useStore((state) => state.currentUser);

    useEffect(() => {
        if (user) {
            console.log('User data loaded:', user);
            setFormData({
                name: user.name,
                email: user.email,
                currentPassword: '',
                newPassword: '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/users/${user?.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al actualizar los datos');
            }

            setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración de Perfil</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Administra la información de tu cuenta, correo electrónico y credenciales de acceso.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de Datos Personales */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                        {/* Avatar o Iniciales Dinámicas */}
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200"
                            />
                        ) : (
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${getAvatarColor(user?.name || 'User')}`}>
                                {getInitials(user?.name || 'User')}
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">{user?.name || 'Cargando...'}</h2>
                            <p className="text-xs text-slate-400 capitalize">Rol: {user?.role.toLowerCase()} {user?.tenant?.name ? `• ${user.tenant.name}` : ''}</p>
                        </div>
                    </div>

                    <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                        <UserIcon size={18} className="text-blue-600" />
                        Información Personal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <UserIcon size={18} />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-sm transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-sm transition-all"
                                    placeholder="correo@empresa.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Seguridad / Contraseña */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Lock size={20} className="text-blue-600" />
                        Seguridad y Contraseña
                    </h2>
                    <p className="text-xs text-slate-400 -mt-4">
                        Deja estos campos en blanco si no deseas cambiar tu contraseña actual.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Contraseña actual</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* Botón de Guardar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isDemoMode || isLoading}
                        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer 
                            ${isDemoMode
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        <Save size={18} />
                        <span>{isDemoMode ? 'Modo Demo: Solo lectura' : 'Guardar cambios'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}