// components/crm-header.tsx
import { logout } from "@/lib/actions";

export default function CrmHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-xl text-blue-600 tracking-tight">
          MyCRM
        </div>
        
        <nav className="flex items-center gap-6">
          <span className="text-sm text-gray-500">Workspace</span>
          <form action={logout}>
            <button 
              type="submit"
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}