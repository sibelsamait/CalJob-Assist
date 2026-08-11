"use client";

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Button } from '@/components/ui/button';
import { supabase, useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';

export default function ConfigurationPage() {
  const { user, profile, refetchProfile } = useAuth();
  const { organization, role, plan } = useProfile();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [rut, setRut] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setRut(profile?.rut || '');
  }, [profile?.full_name, profile?.rut]);

  const save = async (event) => {
    event.preventDefault();

    if (!supabase || !user) {
      setError('No se pudo conectar con Supabase.');
      return;
    }

    const normalizedFullName = fullName.trim();
    const normalizedRut = rut.trim();

    if (!normalizedFullName || !normalizedRut) {
      setError('Debes completar tu nombre completo y tu RUT para continuar.');
      return;
    }

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: normalizedFullName,
          rut: normalizedRut,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (updateError) {
      setError(updateError.message);
    } else {
      await refetchProfile();
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos fueron guardados correctamente.',
      });
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra los datos visibles de tu perfil."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form
          onSubmit={save}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>

          <div className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Nombre completo
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="Ej: Juan Carlos Pérez"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              RUT
              <input
                value={rut}
                onChange={(event) => setRut(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="12.345.678-9"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Correo electrónico
              <input
                value={user?.email || ''}
                disabled
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-5">
              <AlertBanner
                tone="error"
                title="No se pudo guardar"
                description={error}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={saving}
            className="mt-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Acceso
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <RoleBadge role={role} />
            <PlanBadge plan={plan} />
          </div>

          <p className="mt-5 text-sm text-slate-600">
            Organización:{' '}
            <strong className="font-medium text-slate-900">{organization}</strong>
          </p>
        </aside>
      </div>
    </div>
  );
}