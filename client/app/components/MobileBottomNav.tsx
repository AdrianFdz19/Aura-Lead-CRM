import { HomeIcon, LayoutDashboard, Building2, Users, Bot, BarChart3, Settings, ChevronLeft, ChevronRight, MessagesSquare, ShieldUser } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Team', path: '/team', icon: ShieldUser },
    { name: 'Chats', path: '/chat', icon: MessagesSquare },
    /* { name: 'Settings', path: '/settings', icon: Settings, onlyAdmin: true }, */
];

export default function MobileBottomNav({ user }: { user: { role: string } | null }) {
    const isAdmin = user?.role === 'ADMIN';

    // Filtramos los enlaces dependiendo si el usuario es admin o no
    /* const filteredLinks = navLinks.filter((link) => {
        if (link.onlyAdmin && !isAdmin) return false;
        return true;
    }); */

    return (
        <div className="flex justify-around items-center h-full bg-white border-t border-slate-200">
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