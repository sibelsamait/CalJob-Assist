"use client";

import { CalendarDays, BellRing } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendario" description="Revisa fechas relevantes, vencimientos y recordatorios de tu actividad." />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Próximos vencimientos</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Sin eventos programados todavía. Cuando agregues fechas, aparecerán aquí en formato visual.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <BellRing className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Recordatorios</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Los avisos y alertas de tus procesos aparecerán aquí para mantenerte al día.</p>
        </div>
      </div>
    </div>
  );
}
