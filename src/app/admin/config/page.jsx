"use client";

import { PageHeader } from '@/components/layout/PageHeader';

export default function AdminConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración SaaS"
        description="Ajusta la configuración global de la plataforma y de los planes disponibles."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">En esta área podrás gestionar las opciones globales de CalJob Assist, los planes y los parámetros de facturación.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Planes activos</h2>
          <p className="mt-2 text-slate-600">Consulta y edita los planes disponibles para los clientes.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Políticas de acceso</h2>
          <p className="mt-2 text-slate-600">Define qué roles pueden ver funciones internas o acceder a herramientas administrativas.</p>
        </div>
      </div>
    </div>
  );
}
