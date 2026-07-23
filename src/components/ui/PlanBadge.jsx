import { PLANS } from '@/lib/constants/plans';

export function PlanBadge({ plan, className = '' }) {
  const normalizedPlan = plan || 'personal';
  const config = PLANS[normalizedPlan] || PLANS.personal;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ backgroundColor: `${config.color}14`, color: config.color, border: `1px solid ${config.color}33` }}
    >
      {config.label}
    </span>
  );
}

export default PlanBadge;
