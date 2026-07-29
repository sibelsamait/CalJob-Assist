import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calculator, BookOpen, ScrollText, Ticket } from 'lucide-react';

export default function UserDashboard({ readonly = false }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Bienvenido a CalJob Assist" description={readonly ? 'Acceso de solo lectura para revisar cálculos e indicadores.' : 'Tu punto de inicio para contratar un plan y usar la plataforma completa.'} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Calculadoras básicas</h2>
          <p className="mt-3 text-slate-600">Usa sueldo líquido, IPC, UF/UTM y más sin guardar resultados.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><Calculator className="h-4 w-4" /> Sueldo líquido</div>
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><BookOpen className="h-4 w-4" /> IPC y UF/UTM</div>
            <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3"><Ticket className="h-4 w-4" /> Indicadores laborales</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tu acceso</h2>
          <p className="mt-3 text-slate-600">{readonly ? 'No puedes guardar cálculos ni acceder a funciones avanzadas.' : 'Contrata un plan para activar el dashboard completo.'}</p>
          {!readonly ? (
            <Link href="/billing/planes" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#003087] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              Ver planes
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">¿Qué puedes hacer?</h2>
        <p className="mt-3 text-slate-600">{readonly ? 'Puedes ver calculadoras e indicadores, pero no guardar ni exportar.' : 'Puedes acceder a los planes y conocer los beneficios de cada uno.'}</p>
        {!readonly && (
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li>- Calculadoras sin guardar</li>
            <li>- Acceso a landing y planes</li>
            <li>- Consultar información básica de la plataforma</li>
          </ul>
        )}
      </div>
    </div>
  );
}
