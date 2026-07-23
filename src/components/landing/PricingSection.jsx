import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/theme';
import { PLANS } from '@/lib/constants/plans';

const plans = [
  { key: 'personal', description: 'Ideal para emprendedores y equipos pequeños.', features: ['Acceso inmediato', 'Gestión simple', 'Soporte básico'] },
  { key: 'team', description: 'Para equipos que necesitan colaboración y seguimiento.', features: ['Todo lo del plan personal', 'Colaboración', 'Soporte prioritario'] },
  { key: 'enterprise', description: 'Para organizaciones que requieren escalabilidad.', features: ['Todo lo del plan equipo', 'Administración avanzada', 'Atención dedicada'] },
];

export function PricingSection({ onSelectPlan }) {
  return (
    <section id="planes" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Planes</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Elige el plan que acompañe tu crecimiento</h2>
          <p className="mt-3 text-lg text-slate-600">Cada opción está pensada para cubrir distintos niveles de operación y soporte.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.key} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">{PLANS[plan.key].label}</h3>
                {plan.key === 'team' ? (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}>
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-semibold text-slate-900">${PLANS[plan.key].price.toLocaleString('es-CL')}</span>
                <span className="pb-1 text-sm text-slate-500">/ mes</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.success }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => onSelectPlan(plan.key)} className="mt-8 w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                Suscribirse
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
