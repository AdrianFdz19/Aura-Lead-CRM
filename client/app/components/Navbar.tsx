// components/layout/Navbar.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, Users, Bot, BarChart3, Settings, ChevronLeft, ChevronRight, MessagesSquare, ShieldUser } from 'lucide-react';

const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Team', path: '/team', icon: ShieldUser },
    { name: 'Chats', path: '/chat', icon: MessagesSquare },
    { name: 'Settings', path: '/settings', icon: Settings, onlyAdmin: true },
];

export default function Navbar({ user }: { user: { role: string } | null }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isAdmin = user?.role === 'ADMIN';

    // Filtramos los enlaces dependiendo si el usuario es admin o no
    const filteredLinks = navLinks.filter((link) => {
        if (link.onlyAdmin && !isAdmin) return false;
        return true;
    });

    return (
        <aside className={`${isExpanded ? 'w-64' : 'w-20'} bg-white shadow-[4px_0_24px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col h-full z-20`}>

            {/* LOGO FIJO ARRIBA */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
                <span className="text-xl font-bold text-blue-600 truncate">
                    {isExpanded ? "MyCRM" : "M"}
                </span>
            </div>

            {/* Botón de colapso */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 text-slate-500 hover:text-blue-600 self-end"
            >
                {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;
                    return (

                        <Link
                            key={link.name}
                            href={link.path}
                            className="flex items-center gap-4 px-3 py-3 rounded-xl transition-colors text-slate-700 hover:bg-blue-50 hover:text-blue-600 group"
                        >
                            <Icon size={22} className="shrink-0" />
                            {isExpanded && <span className="font-medium whitespace-nowrap">{link.name}</span>}
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
}