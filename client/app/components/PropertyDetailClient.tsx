"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Edit3, CheckCircle } from 'lucide-react';
import { PropertyType } from '@/types/property';
import MediaUploader from './MediaUploader';

interface PropertyDetailProps {
    propertyId: string;
}

// Definimos un tipo parcial para el formulario, ya que no todos los campos son obligatorios o editables a la vez.
type PropertyEditForm = Partial<Omit<PropertyType, 'id' | 'imageUrl' | 'tenantId' | 'createdAt' | 'updatedAt'>>;

export default function PropertyDetailClient({ propertyId }: PropertyDetailProps) {
    const router = useRouter();
    const [property, setProperty] = useState<PropertyType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [editFormData, setEditFormData] = useState<PropertyEditForm>({});
    const [remainingImageKeys, setRemainingImageKeys] = useState<string[]>([]); // S3 Keys de imágenes que se quedan
    const [newFilesToUpload, setNewFilesToUpload] = useState<File[]>([]);

    useEffect(() => {
        async function fetchPropertyDetails() {
            try {
                const res = await fetch(`/api/properties/${propertyId}`);
                if (!res.ok) throw new Error('Failed to fetch property details');
                const data = await res.json();
                console.log(data);
                setProperty(data);
            } catch (error) {
                console.error("Error loading property:", error);
            } finally {
                setLoading(false);
            }
        }

        if (propertyId) {
            fetchPropertyDetails();
        }
    }, [propertyId]);

    const handleOpenEditModal = () => {
        if (property) {
            // Pre-cargamos el formulario con los datos actuales de la propiedad
            setEditFormData({
                title: property.title,
                description: property.description,
                price: property.price,
                location: property.location,
                status: property.status,
                commission: property.commission,
                type: property.type,
                // No necesitamos pasar `images` aquí, ya que el uploader se alimentará de forma diferente
            });

            // 🔑 SOLUCIÓN: Ahora que la API devuelve `imageKeys`, podemos inicializar el estado correctamente.
            setRemainingImageKeys(property.imageKeys || []);
            
            // Limpiamos los archivos nuevos por si el modal se abrió y cerró antes
            setNewFilesToUpload([]);

            setIsEditModalOpen(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Para los campos numéricos, convertimos el valor
        const isNumeric = ['price', 'commission'].includes(name);
        setEditFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let uploadedKeys: string[] = [];

            // 1. Si hay nuevos archivos seleccionados, los subimos a S3
            if (newFilesToUpload.length > 0) {
                const uploadPromises = newFilesToUpload.map(async (file) => {
                    const resSign = await fetch('/api/upload-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileType: file.type })
                    });
                    if (!resSign.ok) throw new Error('Failed to get upload URL');
                    const { uploadUrl, fileKey } = await resSign.json();

                    const resS3 = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type },
                        body: file
                    });
                    if (!resS3.ok) throw new Error('Failed to upload file to S3');

                    return fileKey;
                });

                uploadedKeys = await Promise.all(uploadPromises);
            }

            // 2. Combinamos las claves de las imágenes que no se borraron con las nuevas que se subieron.
            const finalImageKeys = [...remainingImageKeys, ...uploadedKeys];

            // 3. Enviamos el array completo al servidor
            const res = await fetch(`/api/properties/${propertyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    images: finalImageKeys // <--- Enviamos el array de S3 Keys consolidado
                })
            });

            if (res.ok) {
                const updatedProperty = await res.json();
                setProperty(updatedProperty); // Actualizamos la vista con los nuevos datos
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 3000);
                setIsEditModalOpen(false);
            } else {
                alert('Failed to update property.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during update.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nueva función para manejar el cambio de imágenes existentes desde el uploader
    const handleExistingImagesChange = (remainingKeys: string[]) => {
        // El uploader ahora nos da directamente las keys que se quedaron.
        setRemainingImageKeys(remainingKeys);
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="p-12 text-center">
                <p className="text-slate-500 text-sm">Property not found.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            {/* Notificación de Éxito (Toast) */}
            {showSuccessToast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-[100] animate-in fade-in slide-in-from-top-12">
                    <CheckCircle size={20} />
                    <span className="text-sm font-semibold">Property updated successfully!</span>
                </div>
            )}

            {/* Cabecera con Botón de Regresar y Acciones */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Inventory
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenEditModal}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                        <Edit3 className="w-4 h-4" />
                        Edit Property
                    </button>
                </div>
            </div>

            {/* Grid Principal de Detalles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda / Imagen y Descripción */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="relative h-[400px] w-full bg-slate-100">
                            <img key={property.images[0]} // Añadimos una key para forzar el re-renderizado si la imagen cambia
                                src={property.images[0] || '/placeholder.jpg'}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {property.title}
                                </h1>
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                    {property.status}
                                </span>
                            </div>
                            <p className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {property.location}
                            </p>
                            <hr className="border-slate-100" />
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Description
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {property.description || 'No description provided for this property.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha / Métricas y Datos Clave */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Financial & Details
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-500 font-medium">Price</span>
                                <span className="text-lg font-bold text-slate-800">
                                    ${Number(property.price).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-500 font-medium">Type</span>
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    {property.type || 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-500 font-medium">Commission</span>
                                <span className="text-sm font-bold text-emerald-600">
                                    {Number(property.commission) > 0 ? `$${Number(property.commission).toLocaleString()}` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Edición */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-bold text-slate-800">Edit Property</h2>
                        </div>

                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Title</label>
                                <input name="title" value={editFormData.title || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                                <textarea name="description" value={editFormData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg h-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Type</label>
                                    <select name="type" value={editFormData.type || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="HOUSE">House</option>
                                        <option value="APARTMENT">Apartment</option>
                                        <option value="LAND">Land</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                                    <select name="status" value={editFormData.status || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="AVAILABLE">Available</option>
                                        <option value="OCCUPIED">Occupied</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Price ($)</label>
                                    <input name="price" type="number" value={editFormData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Commission ($)</label>
                                    <input name="commission" type="number" value={editFormData.commission || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Location</label>
                                <input name="location" value={editFormData.location || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>

                            {/* Componente para modificar las imagenes de la propiedad */}
                            <MediaUploader
                                initialImages={
                                    // Mapeamos las keys y urls para el uploader
                                    (property?.imageKeys || []).map((key, index) => ({ key, url: property?.images[index] || '' }))
                                }
                                onExistingImagesChange={handleExistingImagesChange}
                                onNewFilesChange={setNewFilesToUpload}
                            />
                        </form>

                        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-property-form" // Esto es para vincular el botón al form, aunque aquí lo pongo dentro del form.
                                disabled={isSubmitting}
                                onClick={handleFormSubmit}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 w-[140px] disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}