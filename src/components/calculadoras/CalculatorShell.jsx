"use client";

import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { IndicatorBar } from '@/components/calculadoras/IndicatorBar';

export function CalculatorShell({ title, description, children }) {
  const { isLoading } = useProfile();
  const permissions = usePermissions();

  if (isLoading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-700" /></div>;
  if (!permissions.canViewCalculators) return <AlertBanner tone="error" title="Sin permisos" description="Tu perfil no tiene acceso a las calculadoras laborales." />;

  return <div className="space-y-6"><PageHeader title={title} description={description} /><IndicatorBar />{children}</div>;
}

export default CalculatorShell;