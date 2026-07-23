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

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request, { params }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase server not ready' }, { status: 500 });

  const { data: paymentRequest, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !paymentRequest) return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });

  if (paymentRequest.payment_method !== 'paypal') {
    return NextResponse.json({ error: 'Payment request not configured for PayPal' }, { status: 400 });
  }

  try {
    const token = await getPayPalToken();
    const mode = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
    const createUrl = `https://${mode}/v2/checkout/orders`;

    const amount = (Number(paymentRequest.amount) || 0).toString();

    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: paymentRequest.currency || 'CLP', value: amount },
          custom_id: paymentRequest.id,
          description: paymentRequest.metadata?.plan_title || 'Suscripción CalJob Assist',
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?requestId=${paymentRequest.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?requestId=${paymentRequest.id}&status=cancelled`,
      },
    };

    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`PayPal create order error: ${res.status} ${txt}`);
    }

    const data = await res.json();
    const approveLink = data.links?.find((l) => l.rel === 'approve')?.href;

    await supabase
      .from('payment_requests')
      .update({ external_id: data.id, checkout_url: approveLink, updated_at: new Date().toISOString() })
      .eq('id', paymentRequest.id);

    if (approveLink) {
      return NextResponse.redirect(approveLink);
    }

    return NextResponse.json({ error: 'Approval URL not available' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
