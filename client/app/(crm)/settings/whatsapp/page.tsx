'use client'; // No olvides esta directiva para componentes interactivos

import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function WhatsAppSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        permanentToken: '',
        phoneNumberId: '',
        wabaId: '',
        phoneNumber: '' // Agregamos este campo para mejorar la UX
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/whatsapp/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) throw new Error('Error al guardar la configuración');
            
            alert('Configuración guardada exitosamente');
            window.location.href = '/dashboard'
        } catch (error) {
            console.error(error);
            alert('Hubo un error al guardar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold">Conexión de WhatsApp Business</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Token de Acceso Permanente" 
                        name="permanentToken"
                        type="password" 
                        value={formData.permanentToken}
                        onChange={handleInputChange}
                        required
                    />
                    <Input 
                        label="Phone Number ID" 
                        name="phoneNumberId"
                        value={formData.phoneNumberId}
                        onChange={handleInputChange}
                        required
                    />
                    <Input 
                        label="WABA ID" 
                        name="wabaId"
                        value={formData.wabaId}
                        onChange={handleInputChange}
                        required
                    />
                    <Input 
                        label="Número de Teléfono (con código de país)" 
                        name="phoneNumber"
                        placeholder="+521234567890"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                    <Button isLoading={isLoading} type="submit">
                        Guardar y Probar
                    </Button>
                </form>

                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">¿Dónde encuentro estos datos?</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>1. Entra a developers.facebook.com</li>
                        <li>2. Ve a tus Apps &gt; [Tu App] &gt; WhatsApp</li>
                        <li>3. Busca "API Setup" para los IDs.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}