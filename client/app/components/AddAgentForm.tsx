'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface AddAgentFormProps {
    onClose: () => void;
}

export default function AddAgentForm({ onClose }: AddAgentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Manejar la selección de la imagen de perfil y su vista previa
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        // 1. Recopilar los datos del formulario usando FormData
        const formData = new FormData(e.currentTarget);

        const agentData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            status: formData.get('status'),
        };

        // 2. Crear el registro del usuario primero para obtener su ID
        const res = await fetch(`/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({agentData})
        });

        if (res.ok) {
            const newUserData = await res.json();
            const { id: userId } = newUserData;

            // 3. Si existe una imagen, pedir URL firmada, subirla a S3 y actualizar el usuario
            if (selectedFile) {
                const uploadRes = await fetch('/api/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileType: selectedFile.type,
                        folder: `users/avatars/${userId}`
                    }),
                });

                if (uploadRes.ok) {
                    const { uploadUrl, fileKey } = await uploadRes.json();

                    // Subir el archivo binario a S3
                    await fetch(uploadUrl, { 
                        method: 'PUT', 
                        body: selectedFile 
                    });

                    // 4. Actualizar el registro del usuario con la key de la imagen
                    await fetch(`/api/users/${userId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            avatar: fileKey
                        })
                    });
                }

                // Mover onClose() aquí para asegurar que solo se cierre si todo fue exitoso
                onClose();
            } else {
                // Si no hay archivo, el proceso termina aquí y es exitoso.
                onClose();
            }
        } else {
            // Si la creación inicial del usuario falla, notificar al usuario.
            const errorData = await res.json();
            alert(`Error creating agent: ${errorData.error || 'Please try again.'}`);
        }

    } catch (error) {
        console.error(`Server error: `, error);
        alert('An unexpected server error occurred. Please try again later.');
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Avatar/Profile Picture */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                </div>
                <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    {selectedFile ? 'Change Picture' : 'Upload Picture'}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
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