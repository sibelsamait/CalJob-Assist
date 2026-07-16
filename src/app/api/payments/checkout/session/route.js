export const dynamic = 'force-dynamic';

import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const paymentRequestId = url.searchParams.get('requestId');
  if (!paymentRequestId) {
    return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
  }

  const supabaseServer = getSupabaseServer();
  const { data: requestData, error } = await supabaseServer
    .from('payment_requests')
    .select('*')
    .eq('id', paymentRequestId)
    .single();

  if (error || !requestData) {
    return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
  }

  if (requestData.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Stripe config missing' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-08-01',
  });

  const amount = Number(requestData.amount ?? 0);
  const lineItem = {
    price_data: {
      currency: requestData.currency || 'CLP',
      product_data: {
        name: requestData.metadata?.plan_title || 'Suscripción CalJob Assist',
        description: `Pago para ${requestData.metadata?.entity_label || 'entidad'}`,
      },
      unit_amount: amount * 100,
    },
    quantity: 1,
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [lineItem],
    payment_method_types: ['card'],
    customer_email: user.email,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success&requestId=${paymentRequestId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=cancel&requestId=${paymentRequestId}`,
    metadata: {
      payment_request_id: paymentRequestId,
      user_id: user.id,
      plan_key: requestData.plan_key,
    },
  });

  await supabaseServer
    .from('payment_requests')
    .update({
      external_id: session.payment_intent,
      checkout_url: session.url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentRequestId);

  return NextResponse.json({ checkoutUrl: session.url });
}
