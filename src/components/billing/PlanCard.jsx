"use client";

import { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { PLANS } from '@/lib/constants/plans';
import { COLORS } from '@/lib/constants/theme';
import { useToast } from '@/components/ui/use-toast';

const FEATURES = {
  personal: ['Acceso a calculadoras laborales', 'Biblioteca de herramientas', 'Soporte básico'],
  team: ['Todo lo del plan Personal', 'Hasta 10 integrantes', 'Soporte prioritario'],
  enterprise: ['Todo lo del plan Equipo', 'Integrantes ilimitados', 'Atención dedicada'],
};

function normalizePlan(plan) {
  return String(plan || '').toLowerCase().replace('user_', '').replace('_added', '');
}

export function PlanCard({ planKey, highlighted = false }) {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const plan = PLANS[planKey];
  const activePlan = normalizePlan(profile?.plan);
  const hasActivePlan = Boolean(profile?.plan) && activePlan !== 'trial';
  const isCurrentPlan = hasActivePlan && activePlan === planKey;

  const handleSelect = () => {
    const checkoutPath = `/billing/checkout?plan=${encodeURIComponent(planKey)}`;

    if (!isAuthenticated) {
      toast({
        title: 'Inicia sesión para continuar',
        description: 'Te llevaremos al inicio de sesión y luego al checkout.',
      });
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    if (isCurrentPlan) {
      router.push('/billing/portal');
      return;
    }

    if (hasActivePlan) {
      setShowChangeConfirmation(true);
      return;
    }

    router.push(checkoutPath);
  };

  if (!plan) return null;

  return (
    <article className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm ${highlighted ? 'border-blue-800 ring-2 ring-blue-800/10' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{plan.label}</h2>
        </div>
        {highlighted ? (
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}>
            Más elegido
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-4xl font-semibold text-slate-900">${plan.price.toLocaleString('es-CL')}</p>
      <p className="mt-1 text-sm text-slate-500">CLP / mes</p>
      <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
        {FEATURES[planKey].map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.success }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {showChangeConfirmation ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p>Ya tienes el plan {PLANS[activePlan]?.label || activePlan} activo. ¿Quieres cambiar al plan {plan.label}?</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => router.push(`/billing/checkout?plan=${encodeURIComponent(planKey)}`)}>
              Cambiar plan
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowChangeConfirmation(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={handleSelect} className="mt-8 w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          {isCurrentPlan ? 'Gestionar suscripción' : hasActivePlan ? 'Cambiar plan' : 'Contratar plan'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </article>
  );
}

export default PlanCard;