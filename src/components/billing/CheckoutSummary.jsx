import { PLANS } from '@/lib/constants/plans';

export function CheckoutSummary({ planKey, entityLabel, paymentLabel }) {
  const plan = PLANS[planKey];

  if (!plan) return null;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">{plan.label}</h2>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-slate-600"><span>Tipo de entidad</span><span className="text-right font-medium text-slate-900">{entityLabel || 'Por seleccionar'}</span></div>
        <div className="flex justify-between gap-4 text-slate-600"><span>Método de pago</span><span className="text-right font-medium text-slate-900">{paymentLabel || 'Se selecciona en el siguiente paso'}</span></div>
        <div className="border-t border-slate-200 pt-4"><div className="flex justify-between gap-4 text-base font-semibold text-slate-900"><span>Total mensual</span><span>${plan.price.toLocaleString('es-CL')} CLP</span></div></div>
      </div>
    </aside>
  );
}

export default CheckoutSummary;