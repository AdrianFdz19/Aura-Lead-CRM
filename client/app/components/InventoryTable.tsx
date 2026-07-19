"use client";

import { useState, useEffect } from 'react';
import { Search, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { PropertyType } from '../types/property';
import { getPublicUrl } from '@/lib/s3';

interface InventoryTable {
    tenantId: string;
};

export default function InventoryClient({ tenantId }: InventoryTable) {
    const [searchTerm, setSearchTerm] = useState('');
    // El estado ahora contiene las propiedades con la URL de la imagen desde el inicio.
    const [properties, setProperties] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. useEffect para la carga inicial de propiedades
    useEffect(() => {
        const fetchInitialProperties = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/properties`);
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);
                } else {
                    console.error('Client error: Failed to fetch initial properties.');
                }
            } catch (error) {
                console.error(`Server error: `, error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialProperties();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar.

    useEffect(() => {
        if (properties.length > 0) console.log(properties);
    }, [properties]);

    // 2. useEffect para la búsqueda (debounce)
    useEffect(() => {
        // Debounce: Espera 500ms después de que el usuario deja de escribir
        const handler = setTimeout(async () => {
            setLoading(true);
            try {
                // Petición a tu API Route
                const response = await fetch(`/api/properties?search=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) throw new Error('Failed to fetch');

                // La API debería devolver los datos con la URL de la imagen ya procesada.
                // Si no es así, tendrías que procesarla aquí también.
                // Asumiendo que la API devuelve el mismo formato que la carga inicial.
                const filteredData = await response.json();
                setProperties(filteredData);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]); // Eliminamos 'properties' de las dependencias para evitar bucles.

    return (
        <>
            {/* 1. MÉTRICAS SUPERIORES (KPI Cards Estilo Premium CRM) */}
            {/* Estas tarjetas son un buen resumen, las mantenemos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Propiedades Activas',
                        value: properties.length || 0,
                        icon: <Briefcase className="w-5 h-5 text-blue-600" />,
                        bg: 'border-blue-100 bg-blue-50/50',
                        border: 'border-l-blue-500'
                    },
                    {
                        label: 'Pending Requests',
                        value: '45',
                        icon: <Users className="w-5 h-5 text-purple-600" />,
                        bg: 'border-purple-100 bg-purple-50/50',
                        border: 'border-l-purple-500'
                    },
                    {
                        label: 'Occupancy Rate',
                        value: '92%',
                        icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
                        bg: 'border-amber-100 bg-amber-50/50',
                        border: 'border-l-amber-500'
                    },
                    {
                        label: 'Estimated Commission',
                        value: '$128,450',
                        icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
                        bg: 'border-emerald-100 bg-emerald-50/50',
                        border: 'border-l-emerald-500'
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`p-4 border border-slate-200 bg-white rounded-xl shadow-sm flex items-center justify-between border-l-4 ${stat.border} hover:shadow-md transition-shadow`}
                    >
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">
                                {stat.value}
                            </h3>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${stat.bg} shrink-0`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>
            {/* La barra de búsqueda ahora está dentro del componente que la controla */}
            <div className="p-6 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-80"
                        placeholder="Search by name, type, location..."
                    />
                </div>
            </div>
            <table className="w-full text-sm min-w-[640px]">
                <thead className="text-slate-400 uppercase text-[10px] tracking-widest font-bold bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left">Property</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Price</th>
                        <th className="px-6 py-4 text-left">Type</th>
                        <th className="px-6 py-4 text-left">Location</th>
                        <th className="px-6 py-4 text-left">Commission</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {/* Mapeamos sobre el estado 'properties' que se actualiza con la búsqueda */}
                    {properties.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-4">
                                <img src={p.imageUrl || '/placeholder.jpg'} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
                                <div>
                                    <p className="font-semibold text-slate-900">{p.title}</p>
                                    <p className="text-slate-400 text-xs">{p.location}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
                                    {p.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">${p.price.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
                                    {p.type || 'N/A'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-slate-600">{p.location}</span>
                            </td>
                            <td className="px-6 py-4">
                                {/* Mostramos la comisión si es mayor que cero */}
                                {p.commission > 0 && `$${p.commission.toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}