"use client";

import { PageHeader } from '@/components/layout/PageHeader';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        description="Revisa los eventos de seguridad y la actividad administrativa en la plataforma."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Aquí se mostrarán los eventos recientes de auditoría y accesos a la plataforma.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">2026-07-23 10:15</td>
              <td className="px-4 py-4">ana@caljob.cl</td>
              <td className="px-4 py-4">Creó nuevo usuario</td>
              <td className="px-4 py-4">Éxito</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">2026-07-23 09:45</td>
              <td className="px-4 py-4">pedro@caljob.cl</td>
              <td className="px-4 py-4">Actualizó plan de cliente</td>
              <td className="px-4 py-4">Éxito</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">2026-07-22 19:30</td>
              <td className="px-4 py-4">ana@caljob.cl</td>
              <td className="px-4 py-4">Revisó logs de auditoría</td>
              <td className="px-4 py-4">Éxito</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
