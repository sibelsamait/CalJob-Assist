import Link from 'next/link';
import { ShieldCheck, Building2, Users, FileText, BarChart3, Ticket } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlanBadge } from '@/components/ui/PlanBadge';

const metrics = [
  { label: 'Usuarios totales', value: '1.240', icon: Users },
  { label: 'Empresas activas', value: '28', icon: Building2 },
  { label: 'Planes vendidos', value: '72', icon: FileText },
  { label: 'Ingresos mes', value: '$4.200.000', icon: BarChart3 },
];

const actions = [
  { label: 'Ir a panel admin', href: '/admin', icon: ShieldCheck },
  { label: 'Ver tickets abiertos', href: '/admin/tickets', icon: Ticket },
  { label: 'Ver logs de auditoría', href: '/admin/audit', icon: FileText },
  { label: 'Gestionar roles', href: '/admin/usuarios', icon: Users },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bienvenido, administrador" description="Acceso total a la plataforma sin restricciones de facturación." />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Administrador</p>
            <h1 className="text-3xl font-bold text-slate-900">Panel principal</h1>
            <p className="mt-2 text-slate-600">Plan efectivo: <strong>Enterprise</strong> — sin billing.</p>
          </div>
          <PlanBadge plan="enterprise" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <metric.icon className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Acciones rápidas</h2>
          <div className="mt-5 grid gap-3">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex items-center gap-3">
                  <action.icon className="h-4 w-4 text-slate-600" />
                  {action.label}
                </span>
                <span className="text-slate-400">›</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Atajos</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>Calculadoras · Trámites · Mediaciones · Biblioteca</li>
            <li>Guías SII · Calendario · Documentos · Configuración</li>
            <li>Accede a datos de usuarios, empresas y logs con un solo clic.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
