import { useProfile } from '@/lib/hooks/useProfile';
import { PageHeader } from '@/components/layout/PageHeader';
import { Ticket, Users, Clock, ShieldCheck } from 'lucide-react';

const summary = [
  { label: 'Tickets abiertos', value: '8', icon: Ticket },
  { label: 'En progreso', value: '5', icon: Clock },
  { label: 'Resueltos hoy', value: '3', icon: ShieldCheck },
  { label: 'Usuarios recientes', value: '12', icon: Users },
];

export default function TecnicoDashboard() {
  const { fullName } = useProfile();

  return (
    <div className="space-y-6">
      <PageHeader title={`Panel técnico — ${fullName}`} description="Acceso enterprise implícito para soporte y diagnóstico." />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Resumen de soporte</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-slate-700">
                <item.icon className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Centro de resolución</h2>
          <p className="mt-3 text-slate-600">Accede a los tickets y reproduce casos para los clientes sin restricciones.</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>Ver tickets abiertos con prioridad.</li>
            <li>Tomar ticket y abrir chat de soporte.</li>
            <li>Responder rápidamente desde el detalle.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Acceso a funciones</h2>
          <p className="mt-3 text-slate-600">Puedes usar todas las funciones de la app para reproducir problemas y validar flujos.</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Calculadoras · Trámites · Mediaciones</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Biblioteca · Guías SII · Calendario</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Documentos · Tickets · Usuarios</div>
          </div>
        </div>
      </div>
    </div>
  );
}
