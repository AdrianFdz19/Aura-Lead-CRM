"use client";

import React, { useState, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';

export interface ImageObject {
    key: string;
    url: string;
}

interface MediaUploaderProps {
    initialImages: ImageObject[]; // Ahora recibe un objeto con key y url
    onExistingImagesChange: (remainingKeys: string[]) => void; // Devuelve solo las keys
    onNewFilesChange: (files: File[]) => void;
}

export default function MediaUploader({ 
    initialImages, 
    onExistingImagesChange, 
    onNewFilesChange 
}: MediaUploaderProps) {
    const [existingImages, setExistingImages] = useState<ImageObject[]>(initialImages);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    // Sincronizar si cambian las iniciales
    useEffect(() => {
        setExistingImages(initialImages);
    }, [initialImages]);

    // Eliminar una imagen existente
    const handleRemoveExisting = (keyToRemove: string) => {
        const updated = existingImages.filter(img => img.key !== keyToRemove);
        const remainingKeys = updated.map(img => img.key);
        setExistingImages(updated);
        onExistingImagesChange(remainingKeys);
    };

    // Agregar nuevos archivos
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        const updatedFiles = [...newFiles, ...selectedFiles];
        setNewFiles(updatedFiles);
        onNewFilesChange(updatedFiles);
    };

    // Eliminar un archivo nuevo antes de subir
    const handleRemoveNewFile = (indexToRemove: number) => {
        const updatedFiles = newFiles.filter((_, index) => index !== indexToRemove);
        setNewFiles(updatedFiles);
        onNewFilesChange(updatedFiles);
    };

    return (
        <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Property Images
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* 1. Imágenes existentes con opción de borrado */}
                {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group h-28 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={image.url} alt={`Property existing ${index + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                            Saved
                        </span>
                        <button
                            type="button"
                            onClick={() => handleRemoveExisting(image.key)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* 2. Nuevas imágenes seleccionadas */}
                {newFiles.map((file, index) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                        <div key={`new-${index}`} className="relative group h-28 bg-slate-100 rounded-2xl overflow-hidden border border-indigo-200 shadow-sm">
                            <img src={previewUrl} alt={`New preview ${index + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                                New
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveNewFile(index)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}

                {/* 3. Botón para agregar */}
                <label className="h-28 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                    <ImagePlus className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">Add Images</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
            </div>
        </div>
    );
}