import { Clock3 } from 'lucide-react';

export function CountdownBadge({ value, unit = 'días', className = '' }) {
  const tone = value <= 1 ? 'text-red-700 bg-red-50' : value <= 3 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}>
      <Clock3 className="h-3.5 w-3.5" />
      {value} {unit}
    </span>
  );
}

export default CountdownBadge;
