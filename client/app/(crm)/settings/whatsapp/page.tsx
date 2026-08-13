'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MessageSquare } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

export default function WhatsAppSettings() {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        accessToken: '',
        phoneNumber: '',
        phoneNumberId: '',
        wabaId: ''
    });

    // Control para saber si ya hay credenciales guardadas previamente
    const [hasExistingConfig, setHasExistingConfig] = useState(false);

    // Recibir la informacion de whatsapp del tenant al montar el componente
    useEffect(() => {
        const fetchWhatsAppData = async () => {
            try {
                const response = await fetch('/api/tenant/whatsapp');
                const data = await response.json();

                if (response.ok && data) {
                    setFormData({
                        accessToken: '', // Por seguridad no rellenamos el token, se queda vacío a menos que lo cambien
                        phoneNumber: data.phoneNumber || '',
                        phoneNumberId: data.phoneNumberId || '',
                        wabaId: data.wabaId || ''
                    });
                    if (data.phoneNumberId) {
                        setHasExistingConfig(true);
                    }
                }
            } catch (error) {
                console.error('Error al obtener datos de WhatsApp:', error);
            }
        };

        fetchWhatsAppData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, phoneNumber: value || '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Enviando datos de configuración de WhatsApp:', formData);
            const response = await fetch('/api/whatsapp/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al guardar la configuración');

            alert('Configuración guardada exitosamente');
            window.location.href = '/settings';
        } catch (error) {
            console.error(error);
            alert('Hubo un error al guardar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
            {/* Header de la sección */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conexión de WhatsApp Business</h1>
                <p className="text-sm text-slate-500">Configura las credenciales oficiales de Meta para habilitar las automatizaciones de chat.</p>
            </div>

            {/* Contenedor principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Formulario */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Token de Acceso Permanente"
                            name="accessToken"
                            type="password"
                            value={formData.accessToken}
                            onChange={handleInputChange}
                            placeholder={hasExistingConfig ? "•••••••••••••••• (Guardado - Escribe uno nuevo para cambiarlo)" : "Escribe tu token permanente..."}
                            required={!hasExistingConfig} // Solo requerido si nunca se ha configurado
                            autoComplete="new-password"     // <-- Esto le dice al navegador que no meta contraseñas guardadas
                            data-lpignore="true"
                        />
                        <Input
                            label="Phone Number ID"
                            name="phoneNumberId"
                            value={formData.phoneNumberId}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            label="Whatsapp Business Account ID (WABA ID)"
                            name="wabaId"
                            value={formData.wabaId}
                            onChange={handleInputChange}
                            required
                        />
                        {/* <Input
                            label="Número de Teléfono (con código de país)"
                            name="phoneNumber"
                            placeholder="+521234567890"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                        /> */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">
                                Número de Teléfono (con código de país)
                            </label>

                            {/* Contenedor con estilos personalizados para que luzca igual que tus demás inputs */}
                            <div className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2">
                                <PhoneInput
                                    international
                                    defaultCountry="MX" // Puedes cambiarlo por el país por defecto que prefieras (ej. México)
                                    value={formData.phoneNumber}
                                    onChange={handlePhoneChange}
                                    required
                                    className="w-full flex items-center gap-2 [&_input]:outline-none [&_input]:w-full [&_select]:bg-transparent [&_select]:cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-slate-400">Selecciona tu país y escribe el número a 10 dígitos.</p>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <Button isLoading={isLoading} type="submit">
                                Guardar y Probar
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Tarjeta de ayuda / instrucciones */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">¿Dónde encuentro estos datos?</h3>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-slate-400 text-xs mt-0.5">1.</span>
                            <span>Entra a <strong className="text-slate-800">developers.facebook.com</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-slate-400 text-xs mt-0.5">2.</span>
                            <span>Ve a tus <strong>Apps &gt; [Tu App] &gt; WhatsApp</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-slate-400 text-xs mt-0.5">3.</span>
                            <span>Busca <strong>"API Setup"</strong> para obtener los IDs y el token de acceso.</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}