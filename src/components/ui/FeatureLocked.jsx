import { Lock } from 'lucide-react';

const FEATURE_MESSAGES = {
  plan: {
    title: 'Función no incluida en tu plan',
    body: 'Actualiza tu plan para acceder a esta funcionalidad.',
    cta: 'Ver planes',
    href: '/billing/planes',
    showCTA: true,
  },
  team_admin: {
    title: 'Función no habilitada',
    body: 'Tu administrador de equipo no ha habilitado esta función para tu cuenta.',
    cta: null,
    href: null,
    showCTA: false,
  },
  permission: {
    title: 'Sin permisos suficientes',
    body: 'No tienes permisos para acceder a esta sección.',
    cta: 'Volver al inicio',
    href: '/dashboard',
    showCTA: true,
  },
};

export default function FeatureLocked({ reason = 'plan', feature = '' }) {
  const msg = FEATURE_MESSAGES[reason] || FEATURE_MESSAGES.permission;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-800">{msg.title}</h2>
      <p className="mb-6 max-w-md text-gray-500">{msg.body}</p>
      {msg.showCTA && msg.href ? (
        <a
          href={msg.href}
          className="inline-flex rounded-lg bg-[#003087] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {msg.cta}
        </a>
      ) : null}
    </div>
  );
}
