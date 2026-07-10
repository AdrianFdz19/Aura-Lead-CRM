import KanbanBoard from '@/app/components/KanbanBoard';
import { getSession } from '@/lib/auth';

export default async function Leads() {

  const session = await getSession();

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Pipeline de Ventas</h1>
      
      { session?.tenantId && <KanbanBoard tenantId={session?.tenantId} /> }
    </div>
  );
}
