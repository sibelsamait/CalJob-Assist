import { useProfile } from '@/lib/hooks/useProfile';
import { useFeatureFlags } from '@/lib/hooks/useFeatureFlags';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';

export default function TeamMemberDashboard() {
  const { fullName } = useProfile();
  const featureFlags = useFeatureFlags();

  const features = [
    { label: 'Calculadoras', enabled: featureFlags.calculadoras },
    { label: 'Trámites', enabled: featureFlags.tramites },
    { label: 'Mediaciones', enabled: featureFlags.mediaciones },
    { label: 'Biblioteca', enabled: featureFlags.biblioteca },
    { label: 'Guías SII', enabled: featureFlags.sii_guides },
    { label: 'Calendario', enabled: featureFlags.calendario },
    { label: 'Documentos', enabled: featureFlags.documentos },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Bienvenido, ${fullName}`} description="Funciones habilitadas por tu administrador de equipo." />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Miembro del equipo</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Tu acceso</h1>
        <p className="mt-3 text-slate-600">Las funciones no habilitadas aparecen bloqueadas y no se muestran a tu administrador.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Funciones disponibles</h2>
          <div className="mt-5 space-y-3">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span>{feature.label}</span>
                <Badge variant={feature.enabled ? 'secondary' : 'outline'}>{feature.enabled ? 'Disponible' : 'No habilitado'}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Datos del equipo</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Acceso personal con permisos limitados.</div>
            <div className="rounded-2xl bg-slate-50 p-4">No ves datos de facturación ni perfiles de otros miembros.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Solicita soporte si necesitas más funciones.</div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#003087] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <span>Crear ticket de soporte</span>
          </div>
        </div>
      </div>
    </div>
  );
}
