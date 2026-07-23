"use client";

import { Building2, CreditCard, Landmark, WalletCards } from 'lucide-react';
import { COLORS } from '@/lib/constants/theme';

const PAYMENT_METHODS = {
  webpay_plus: { label: 'Webpay Plus', description: 'Tarjetas y prepago nacional', icon: CreditCard, entities: ['natural_person', 'private_company'] },
  mercado_pago: { label: 'Mercado Pago', description: 'Pago rápido con tu cuenta', icon: WalletCards, entities: ['natural_person'] },
  flow: { label: 'Flow', description: 'Medios de pago locales', icon: CreditCard, entities: ['natural_person', 'private_company'] },
  khipu: { label: 'Khipu', description: 'Transferencia bancaria segura', icon: Landmark, entities: ['natural_person'] },
  paypal: { label: 'PayPal', description: 'Pago internacional', icon: WalletCards, entities: ['natural_person'] },
  bank_transfer: { label: 'Transferencia bancaria', description: 'Validación manual por el equipo', icon: Landmark, entities: ['natural_person', 'private_company', 'public_entity'] },
  purchase_order: { label: 'Orden de compra', description: 'Para organismos públicos', icon: Building2, entities: ['public_entity'] },
};

export function getPaymentMethods(entityType) {
  return Object.entries(PAYMENT_METHODS)
    .filter(([, method]) => method.entities.includes(entityType))
    .map(([key, method]) => ({ key, ...method }));
}

export function PaymentMethodSelector({ entityType, value, onChange }) {
  const methods = getPaymentMethods(entityType);

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">Método de pago</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const Icon = method.icon;
          const selected = value === method.key;
          return (
            <button
              key={method.key}
              type="button"
              onClick={() => onChange(method.key)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-blue-800 bg-blue-50 ring-1 ring-blue-800' : 'border-slate-200 bg-white'}`}
              aria-pressed={selected}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: selected ? COLORS.primary : COLORS.muted }} />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{method.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{method.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default PaymentMethodSelector;