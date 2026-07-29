"use client";

import { PageHeader } from '@/components/layout/PageHeader';

export default function AdminUsuariosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administra cuentas, roles y permisos del equipo y la plataforma."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          En esta sección podrás revisar usuarios, asignar roles y observar actividad reciente.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Total usuarios</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">1.240</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">2</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Técnicos</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">3</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Ana Admin</td>
              <td className="px-4 py-4">ana@caljob.cl</td>
              <td className="px-4 py-4">Administrador</td>
              <td className="px-4 py-4">Activo</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">Pedro Técnico</td>
              <td className="px-4 py-4">pedro@caljob.cl</td>
              <td className="px-4 py-4">Técnico</td>
              <td className="px-4 py-4">Activo</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-4">María PlanOwner</td>
              <td className="px-4 py-4">maria@cliente.cl</td>
              <td className="px-4 py-4">Dueño de plan</td>
              <td className="px-4 py-4">Activo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
