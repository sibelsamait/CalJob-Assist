import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function getPayPalToken() {
  const mode = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
  const url = `https://${mode}/v1/oauth2/token`;
  const creds = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Unable to obtain PayPal token');
  const data = await res.json();
  return data.access_token;
}

export async function GET(request, { params }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase server not ready' }, { status: 500 });

  const { data: paymentRequest, error } = await supabase.from('payment_requests').select('*').eq('id', id).single();
  if (error || !paymentRequest) return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });

  if (paymentRequest.payment_method !== 'paypal') return NextResponse.json({ error: 'Not configured for PayPal' }, { status: 400 });
  if (!process.env.PAYPAL_PLAN_ID) return NextResponse.json({ error: 'Missing PAYPAL_PLAN_ID' }, { status: 500 });

  try {
    const token = await getPayPalToken();
    const mode = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
    const url = `https://${mode}/v1/billing/subscriptions`;

    const body = {
      plan_id: process.env.PAYPAL_PLAN_ID,
      custom_id: paymentRequest.id,
      application_context: {
        brand_name: 'CalJob Assist',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success&requestId=${paymentRequest.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=cancel&requestId=${paymentRequest.id}`,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`PayPal create subscription error: ${res.status} ${txt}`);
    }

    const data = await res.json();
    const approve = data.links?.find((l) => l.rel === 'approve')?.href;

    await supabase.from('payment_requests').update({ external_id: data.id, checkout_url: approve, updated_at: new Date().toISOString() }).eq('id', paymentRequest.id);

    if (approve) return NextResponse.redirect(approve);
    return NextResponse.json({ error: 'Approval URL not returned' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
