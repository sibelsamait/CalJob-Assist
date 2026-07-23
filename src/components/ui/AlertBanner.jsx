import { AlertTriangle, CircleAlert, Info } from 'lucide-react';
import { COLORS } from '@/lib/constants/theme';

export function AlertBanner({ title, description, tone = 'warning', action, className = '' }) {
  const tones = {
    warning: { icon: AlertTriangle, bg: '#fff7ed', text: COLORS.warning, border: '#fed7aa' },
    error: { icon: CircleAlert, bg: '#fef2f2', text: COLORS.error, border: '#fecaca' },
    info: { icon: Info, bg: '#eff6ff', text: COLORS.primary, border: '#bfdbfe' },
  };

  const style = tones[tone] || tones.warning;
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${className}`} style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default AlertBanner;
