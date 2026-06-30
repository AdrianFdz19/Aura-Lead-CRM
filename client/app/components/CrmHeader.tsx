// components/CrmHeader.tsx
import { Bell, Bot, LogOut } from 'lucide-react'; // Asegúrate de tener lucide-react

export default function CrmHeader({ onOpenChat, brokerName, brokerRole }: {
  onOpenChat: () => void,
  brokerName: string,
  brokerRole: 'admin' | 'agente'
}) {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
      {/* Lado Derecho: Acciones */}
      <div className="flex items-center gap-4">

        <button
          onClick={onOpenChat}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Bot size={18} />
          Asistente
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
          {brokerName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{brokerName}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{brokerRole}</p>
        </div>
      </div>
    </header>
  );
}