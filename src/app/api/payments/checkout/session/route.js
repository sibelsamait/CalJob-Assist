export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const PROVIDER_PATHS = {
  webpay_plus: 'webpay',
  mercado_pago: 'mercadopago',
  flow: 'flow',
  khipu: 'khipu',
  paypal: 'paypal',
};

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
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server client could not be initialized' }, { status: 500 });
  }

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

  const providerKey = PROVIDER_PATHS[requestData.payment_method];
  if (!providerKey) {
    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
  }

  const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-links/${providerKey}/${requestData.id}`;

  return NextResponse.json({ checkoutUrl });
}
