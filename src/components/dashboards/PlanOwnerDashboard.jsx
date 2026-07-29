import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/AlertBanner';

const FEATURE_LIST = [
  { name: 'Calculadoras', enabled: true },
  { name: 'Trámites', enabled: true },
  { name: 'Mediaciones', enabled: true },
  { name: 'Biblioteca', enabled: true },
];

export default function PlanOwnerDashboard() {
  const { fullName, profile } = useProfile();
  const plan = profile?.plan || 'personal';
  const expiresAt = profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString('es-CL') : 'Sin fecha';
  const daysRemaining = profile?.plan_expires_at
    ? Math.max(0, Math.ceil((new Date(profile.plan_expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title={`Bienvenido, ${fullName}`} description="Accede a tu gestión de plan, equipo y funciones activas." />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Plan actual</p>
            <h1 className="text-3xl font-bold text-slate-900">{plan}</h1>
            <p className="mt-2 text-slate-600">Vence: {expiresAt}</p>
            {daysRemaining !== null && daysRemaining < 7 && (
              <AlertBanner tone="warning" title="Tu plan vence pronto" description={`Quedan ${daysRemaining} días para renovar.`} />
            )}
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">Días restantes</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{daysRemaining ?? '∞'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Mis funciones</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            {FEATURE_LIST.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span>{feature.name}</span>
                <Badge variant={feature.enabled ? 'secondary' : 'outline'}>{feature.enabled ? 'Activo' : 'Bloqueado'}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Mi equipo</h2>
          <p className="mt-3 text-slate-600">Gestiona usuarios, permisos y facturación de tu plan.</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Usuarios activos: 4 / 10</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Miembros invitados: 2</div>
            <Link href="/dashboard/configuracion/equipo" className="inline-flex items-center justify-center rounded-2xl bg-[#003087] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              Invitar miembro
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Últimos cálculos guardados</h2>
        <div className="mt-5 grid gap-3 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Cálculo de finiquito - 18 de julio</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Calculo de horas extra - 15 de julio</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Simulación IPC - 12 de julio</div>
        </div>
      </div>
    </div>
  );
}
