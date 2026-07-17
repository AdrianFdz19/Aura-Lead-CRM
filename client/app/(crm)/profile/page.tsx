import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { User, Mail, Building, ShieldCheck } from 'lucide-react';

async function getUserProfile(userId: string) {
  if (!userId) return null;
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      tenant: {
        select: {
          name: true,
        },
      },
    },
  });
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserProfile(session.userId);
  if (!user) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div className="w-full h-full bg-slate-50 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.tenant?.name}</p>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-slate-700"><Mail size={16} className="text-slate-400" /> {user.email}</div>
          <div className="flex items-center gap-3 text-slate-700"><ShieldCheck size={16} className="text-slate-400" /> Rol: <span className="font-semibold capitalize">{user.role.toLowerCase()}</span></div>
        </div>
      </div>
    </div>
  );
}
