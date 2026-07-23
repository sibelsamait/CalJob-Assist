"use client";

import { RefreshCw } from 'lucide-react';
import { useEconomicData } from '@/lib/hooks/useEconomicData';
import { COLORS } from '@/lib/constants/theme';
import { AlertBanner } from '@/components/ui/AlertBanner';

const INDICATORS = [
  { key: 'uf', label: 'UF', color: COLORS.primary },
  { key: 'utm', label: 'UTM', color: COLORS.accent },
  { key: 'imm', label: 'IMM', color: COLORS.success },
  { key: 'ipc', label: 'IPC', color: COLORS.warning },
];

function formatIndicator(key, value) {
  if (value === null || value === undefined || value === '') return 'Sin dato';
  if (key === 'ipc') return `${Number(value).toLocaleString('es-CL', { maximumFractionDigits: 2 })}%`;
  return `$${Number(value).toLocaleString('es-CL', { maximumFractionDigits: 2 })}`;
}

export function IndicatorBar() {
  const { indicators, loading, error, hasCache } = useEconomicData();

  if (loading) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{INDICATORS.map((indicator) => <div key={indicator.key} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div>;

  return <div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{INDICATORS.map((indicator) => <div key={indicator.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{indicator.label}</span><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: indicator.color }} /></div><p className="mt-3 text-lg font-semibold text-slate-900">{formatIndicator(indicator.key, indicators[indicator.key])}</p></div>)}</div>{error || hasCache ? <div className="mt-3"><AlertBanner tone="warning" title="Indicadores económicos usando caché" description="Los valores pueden no estar actualizados." action={<span className="inline-flex items-center gap-1 text-xs"><RefreshCw className="h-3 w-3" />Se actualizarán al volver a cargar</span>} /></div> : null}</div>;
}

export default IndicatorBar;