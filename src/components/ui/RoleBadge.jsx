import { COLORS } from '@/lib/constants/theme';

const ROLE_LABELS = {
  admin: 'Administrador',
  user: 'Usuario',
};

export function RoleBadge({ role, className = '' }) {
  const normalizedRole = role || 'user';
  const tone = {
    admin: { bg: `${COLORS.primary}14`, color: COLORS.primary },
    user: { bg: `${COLORS.accent}14`, color: COLORS.accent },
  }[normalizedRole] || { bg: `${COLORS.border}40`, color: COLORS.text };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.color }}
    >
      {ROLE_LABELS[normalizedRole] || ROLE_LABELS.user}
    </span>
  );
}

export default RoleBadge;
