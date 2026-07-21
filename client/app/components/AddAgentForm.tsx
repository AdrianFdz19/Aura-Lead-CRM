'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface AddAgentFormProps {
    onClose: () => void;
}

export default function AddAgentForm({ onClose }: AddAgentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock submit handler para simular el envío
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Form submitted with form data.");
        
        // Simulación de llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        alert("Agent created successfully! (Simulation)");
        onClose(); // Cierra el modal al finalizar
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Avatar/Profile Picture */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    Upload Picture
                    <input type="file" className="hidden" accept="image/*" />
                </label>
            </div>

            {/* Campos del Formulario */}
            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name</label>
                <input name="name" type="text" placeholder="e.g., John Doe" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Email Address</label>
                <input name="email" type="email" placeholder="john.doe@example.com" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Phone Number</label>
                <input name="phone" type="tel" placeholder="+1 (555) 123-4567" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Role</label>
                    <select name="role" defaultValue="Sales Agent" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Sales Agent">Sales Agent</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                    <select name="status" defaultValue="Active" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Botón de envío dentro del formulario para que se pueda vincular desde fuera si es necesario */}
            <button type="submit" id="add-agent-submit-button" className="hidden">Submit</button>
        </form>
    );
}