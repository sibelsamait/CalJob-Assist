import { CircleAlert, Info, TriangleAlert, CheckCircle2 } from 'lucide-react';
import { COLORS } from '@/lib/constants/theme';

const CONFIG = {
  error: { icon: CircleAlert, color: COLORS.error, label: 'Error' },
  warning: { icon: TriangleAlert, color: COLORS.warning, label: 'Advertencia' },
  info: { icon: Info, color: COLORS.primary, label: 'Información' },
};

export function ValidationFlags({ flags = [] }) {
  const hasErrors = flags.some((flag) => flag.type === 'error');

  if (flags.length === 0) {
    return <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><p className="font-semibold">APROBADO PARA FIRMA</p><p className="mt-1">No encontramos observaciones en los datos ingresados.</p></div></div>;
  }

  return <div className={`rounded-xl border p-4 ${hasErrors ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}><p className={`font-semibold ${hasErrors ? 'text-red-900' : 'text-amber-900'}`}>{hasErrors ? '⛔ RECHAZADO — requiere revisión' : 'Revisión recomendada'}</p><ul className="mt-3 space-y-3">{flags.map((flag, index) => { const config = CONFIG[flag.type] || CONFIG.info; const Icon = config.icon; return <li key={`${flag.message}-${index}`} className="flex items-start gap-2 text-sm" style={{ color: config.color }}><Icon className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>{config.label}:</strong> {flag.message}</span></li>; })}</ul></div>;
}

export default ValidationFlags;