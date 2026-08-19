"use client";

import { useState, useEffect } from 'react';
import { Search, Briefcase, TrendingUp, Users, DollarSign, ArrowUpDown } from 'lucide-react';
import { PropertyType } from '../types/property';
import { useRouter } from 'next/navigation';
import { getPublicUrl } from '@/lib/s3';
import { TableSkeleton } from './properties/TableSkeleton';

interface InventoryTable {
    tenantId: string;
};

export default function InventoryClient({ tenantId }: InventoryTable) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    // El estado ahora contiene las propiedades con la URL de la imagen desde el inicio.
    const [properties, setProperties] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const [kpis, setKpis] = useState({
        activeProperties: 0,
        pendingRequests: 0,
        occupancyRate: 0,
        estimatedCommission: 0
    });

    useEffect(() => {
        async function fetchKPIs() {
            try {
                const res = await fetch('/api/properties/kpis');
                if (res.ok) {
                    const data = await res.json();
                    setKpis(data);
                }
            } catch (error) {
                console.error('Failed to load KPIs', error);
            }
        }
        fetchKPIs();
    }, []);

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
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                params.append('sortPrice', sortOrder); // Enviamos el criterio de orden
                // Petición a tu API Route
                const response = await fetch(`/api/properties?${params.toString()}`);
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
    }, [searchTerm, sortOrder]); // Eliminamos 'properties' de las dependencias para evitar bucles.

    return (
        <>
            {/* 1. CONTENEDOR GENERAL DE MÉTRICAS CON PADDING UNIFORME */}
            <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
                {/* Métricas Superiores (KPI Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Active Properties',
                            value: kpis.activeProperties,
                            icon: <Briefcase className="w-5 h-5 text-blue-600" />,
                            bg: 'border-blue-100 bg-blue-50/50',
                            border: 'border-l-blue-500'
                        },
                        {
                            label: 'Pending Requests',
                            value: kpis.pendingRequests,
                            icon: <Users className="w-5 h-5 text-purple-600" />,
                            bg: 'border-purple-100 bg-purple-50/50',
                            border: 'border-l-purple-500'
                        },
                        {
                            label: 'Occupancy Rate',
                            value: `${kpis.occupancyRate}%`,
                            icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
                            bg: 'border-amber-100 bg-amber-50/50',
                            border: 'border-l-amber-500'
                        },
                        {
                            label: 'Estimated Commission',
                            value: `$${kpis.estimatedCommission}`,
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
            </div>
            {/* La barra de búsqueda ahora está dentro del componente que la controla */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Contenedor del buscador, ahora es flexible */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-80 outline-none"
                        placeholder="Search by name, type, location..."
                    />
                </div>
                {/* Botón / Selector de Ordenamiento por Precio */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end flex-shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Price:</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="desc">Highest to Lowest</option>
                        <option value="asc">Lowest to Highest</option>
                    </select>
                </div>
            </div>
            {/* Contenido condicional: Si está cargando y no hay datos previos, mostramos el esqueleto */}
            {loading && properties.length === 0 ? (
                <TableSkeleton />
            ) : properties.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                    No se encontraron propiedades.
                </div>
            ) : (
                <>
                    {/* Tabla Escritorio */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
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
                                {properties.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/properties/${p.id}`)}
                                    >
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <img src={p.images[0] || '/placeholder.jpg'} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
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
                    </div>

                    {/* Cards Móvil */}
                    <div className="md:hidden space-y-3">
                        {properties.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => router.push(`/properties/${p.id}`)}
                                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col gap-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <img src={p.images[0] || '/placeholder.jpg'} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <p className="font-bold text-slate-900">{p.title}</p>
                                        <p className="text-slate-400 text-xs">{p.location}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <span className="font-bold text-slate-700">${p.price.toLocaleString()}</span>
                                    <button className="text-indigo-600 text-sm font-semibold">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}