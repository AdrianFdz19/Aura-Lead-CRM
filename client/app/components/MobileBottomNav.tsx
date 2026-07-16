import { HomeIcon, LayoutDashboard, Building2, Users, Bot, BarChart3, Settings, ChevronLeft, ChevronRight, MessagesSquare } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventario', path: '/properties', icon: Building2 },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Chats', path: '/chat', icon: MessagesSquare },
    { name: 'Reportes', path: '/reports', icon: BarChart3 },
];

export default function MobileBottomNav() {
    return (
        <div className="flex justify-around items-center h-full bg-white border-t border-slate-200">
            {/* Tus iconos aquí, por ejemplo: */}
            <button className="flex flex-col items-center justify-center text-slate-600">
                <HomeIcon size={20} />
                <span className="text-[10px]">Inicio</span>
            </button>
            {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                    <Link 
                        className="flex flex-col items-center justify-center text-slate-600"
                        key={link.path} 
                        href={link.path}
                        >
                        <IconComponent size={20} />
                        <span className="text-[10px] mt-1">{link.name}</span>
                    </Link>
                )
            })}
        </div>
    );
}