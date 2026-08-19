// app/(crm)/team/[id]/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPublicUrl } from "@/lib/s3";
import { Users, Mail, Phone, ShieldCheck, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/team");

  const { id: agentId } = await params;

  // Buscar al agente validando que sea del mismo tenant
  const rawAgent = await prisma.user.findFirst({
    where: { 
      id: agentId,
      tenantId: session.tenantId 
    },
    include: {
      assignedLeads: true,
      tenant: { select: { name: true } }
    }
  });

  // Si no se encuentra, simplemente lo redirigimos de vuelta a la lista del equipo
  if (!rawAgent) {
    redirect("/team");
  }

  // Resolver avatar de S3 si existe
  let agentAvatarUrl = null;
  if (rawAgent.avatar) {
    try {
      agentAvatarUrl = await getPublicUrl(rawAgent.avatar);
    } catch (err) {
      console.error("Error fetching agent avatar:", err);
    }
  }

  const agent = { ...rawAgent, avatar: agentAvatarUrl };

  return (
    <div className="w-full h-full bg-slate-50/50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Botón de Retorno */}
        <div>
          <Link href="/team" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={16} />
            <span>Volver al equipo</span>
          </Link>
        </div>

        {/* Tarjeta de Perfil del Agente */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-2xl object-cover shadow-md border" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-md">
                {agent.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{agent.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'}`}>
                  {agent.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-slate-500">{agent.email}</p>
            </div>
          </div>
        </div>

        {/* Sección de Leads Asignados a este Agente */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Leads bajo la responsabilidad de {agent.name}</h3>
          <p className="text-xs text-slate-500 mb-4">Total asignados: {agent.assignedLeads.length}</p>
          
          {agent.assignedLeads.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Este agente no tiene leads asignados actualmente.</p>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Cliente / Lead</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {agent.assignedLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{lead.name || lead.companyName || 'Sin Nombre'}</td>
                      <td className="py-3 px-4 text-slate-500">{lead.phone || lead.email || 'N/D'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/50">
                          {lead.status || 'Activo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}