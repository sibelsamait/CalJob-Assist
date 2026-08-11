"use client";

import { Users, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function EquipoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mi equipo" description="Gestiona a las personas asociadas a tu organización y sus accesos." />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Equipo</h2>
              <p className="text-sm text-slate-600">Aún no has agregado miembros a tu organización.</p>
            </div>
          </div>

          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <Plus className="h-4 w-4" />
            Agregar miembro
          </button>
        </div>
      </div>
    </div>
  );
}
