import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const PAYMENT_FLOW = {
  natural_person: {
    label: 'Persona Natural',
    activation: 'Automática tras pago aprobado',
  },
  private_company: {
    label: 'Empresa Privada',
    activation: 'Validación manual tras OC o transferencia',
  },
  public_entity: {
    label: 'Organismo Público',
    activation: 'Activación tras contrato y orden de compra',
  },
};

const PLAN_PRICES = {
  personal: { amount: 15000, label: 'Plan Personal' },
  team: { amount: 49000, label: 'Plan Equipo' },
  enterprise: { amount: 149000, label: 'Plan Empresarial' },
};

export async function POST(request) {
  const payload = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const planKey = payload.planKey;
  const entityType = payload.entityType;
  const paymentMethod = payload.paymentMethod;

  if (!planKey || !entityType || !paymentMethod) {
    return NextResponse.json({ error: 'Missing plan, entity type or payment method' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const { data: profileData } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
  const companyId = profileData?.company_id ?? null;
  const planMeta = PLAN_PRICES[planKey] || { amount: 0, label: planKey };
  const record = {
    user_id: user.id,
    company_id: companyId,
    plan_key: planKey,
    entity_type: entityType,
    payment_method: paymentMethod,
    status: entityType === 'natural_person' ? 'pending_payment' : 'pending_approval',
    amount: planMeta.amount,
    currency: 'CLP',
    metadata: {
      entity_label: PAYMENT_FLOW[entityType]?.label,
      plan_title: planMeta.label,
      payment_method: paymentMethod,
    },
  };

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server client could not be initialized' }, { status: 500 });
  }

  const { data, error } = await supabaseServer.from('payment_requests').insert([record]).select().single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to create payment request' }, { status: 500 });
  }

  if (entityType === 'natural_person') {
    if (['webpay_plus', 'mercado_pago', 'flow', 'khipu', 'paypal'].includes(paymentMethod)) {
      return NextResponse.json({
        status: 'checkout_ready',
        checkoutUrl: `/api/payments/checkout/session?requestId=${data.id}`,
        message: 'Redirigiendo al enlace de pago seguro para personas naturales',
      });
    }

    return NextResponse.json({
      status: 'pending_manual_payment',
      message: 'Pago en persona natural registrado. Se generará un enlace de pago o cobro directo según el método elegido.',
      paymentRequestId: data.id,
    });
  }

  if (entityType === 'private_company') {
    return NextResponse.json({
      status: 'pending_manual_activation',
      message: 'Solicitud registrada. Nuestro equipo validará la orden de compra o transferencia y activará la licencia.',
      paymentRequestId: data.id,
    });
  }

  return NextResponse.json({
    status: 'pending_contract_activation',
    message: 'El flujo para organismos públicos quedó registrado. Se generará contrato y orden de compra según normativa.',
    paymentRequestId: data.id,
  });
}

export async function GET(request) {
  const url = new URL(request.url);
  const requestId = url.searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
  }

  return NextResponse.json({
    checkoutUrl: `/api/payments/checkout/session?requestId=${requestId}`,
  });
}
