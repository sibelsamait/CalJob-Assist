"use client";

import { PageHeader } from '@/components/layout/PageHeader';

export default function AdminEmpresasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        description="Revisa el estado de las empresas registradas, sus planes y el estado de la suscripción."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Controla los datos principales de las empresas activas, sus planes y el status de facturación.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Empresas activas</h2>
          <p className="mt-2 text-slate-600">28 empresas actualmente con acceso completo.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Planes pendientes</h2>
          <p className="mt-2 text-slate-600">3 empresas con renovación pendiente o plan en prueba.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">RUT</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Constructora Silva SpA</td>
              <td className="px-4 py-4">76.123.456-7</td>
              <td className="px-4 py-4">Enterprise</td>
              <td className="px-4 py-4">Activo</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Estudio Jurídico Morales</td>
              <td className="px-4 py-4">12.345.678-9</td>
              <td className="px-4 py-4">Team</td>
              <td className="px-4 py-4">Activo</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Transporte Andino Ltda.</td>
              <td className="px-4 py-4">77.654.321-0</td>
              <td className="px-4 py-4">Personal</td>
              <td className="px-4 py-4">Trial</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
