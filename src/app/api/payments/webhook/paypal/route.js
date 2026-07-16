import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function verifyPayPalWebhook(rawBody, hdrs) {
  const mode = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
  const url = `https://${mode}/v1/notifications/verify-webhook-signature`;

  const tokenRes = await fetch(`https://${mode}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) throw new Error('Unable to get PayPal token for verification');
  const { access_token } = await tokenRes.json();

  const payload = {
    auth_algo: hdrs.get('paypal-auth-algo') || hdrs.get('paypal-auth-algo'.toLowerCase()),
    cert_url: hdrs.get('paypal-cert-url') || hdrs.get('paypal-cert-url'.toLowerCase()),
    transmission_id: hdrs.get('paypal-transmission-id') || hdrs.get('paypal-transmission-id'.toLowerCase()),
    transmission_sig: hdrs.get('paypal-transmission-sig') || hdrs.get('paypal-transmission-sig'.toLowerCase()),
    transmission_time: hdrs.get('paypal-transmission-time') || hdrs.get('paypal-transmission-time'.toLowerCase()),
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: rawBody,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return false;
  const verification = await res.json();
  return verification.verification_status === 'SUCCESS';
}

export async function POST(request) {
  const raw = await request.json();
  const hdrs = headers();

  try {
    const verified = await verifyPayPalWebhook(raw, hdrs);
    if (!verified) return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }

  const eventType = raw.event_type || raw.eventType;
  const resource = raw.resource || {};

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  // Handle capture completed
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'PAYMENT.SALE.COMPLETED') {
    const orderId = resource.supplementary_data?.related_ids?.order_id || resource.order_id || resource.id;
    const customId = resource.custom_id || (resource.invoice_id ? resource.invoice_id : null) || resource.purchase_units?.[0]?.custom_id;

    const requestId = customId || orderId;
    if (!requestId) return NextResponse.json({ error: 'No payment_request id found in webhook' }, { status: 400 });

    await supabase.from('payment_requests').update({ status: 'paid', provider: 'paypal', external_id: orderId, updated_at: new Date().toISOString() }).eq('id', requestId);

    // create license
    await supabase.from('licenses').insert({ user_id: resource.payer?.payer_id || null, payment_request_id: requestId, product_key: `CALJOB-${requestId}`, status: 'active', issued_at: new Date().toISOString() });
  }

  if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'PAYMENT.SALE.DENIED' || eventType === 'PAYMENT.CAPTURE.REFUNDED') {
    const customId = resource.purchase_units?.[0]?.custom_id || resource.invoice_id || resource.custom_id;
    const requestId = customId || resource.order_id || resource.id;
    if (requestId) {
      await supabase.from('payment_requests').update({ status: 'failed', provider: 'paypal', updated_at: new Date().toISOString() }).eq('id', requestId);
      // mark existing license as canceled/failed
      await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('payment_request_id', requestId);
    }
  }

  // Handle subscription lifecycle events
  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
    const subscriptionId = resource.id || resource.subscription_id || resource.supplementary_data?.related_ids?.subscription_id;
    // find payment_request by external_id = subscriptionId
    if (subscriptionId) {
      await supabase.from('payment_requests').update({ status: 'canceled', provider: 'paypal', updated_at: new Date().toISOString() }).eq('external_id', subscriptionId);
      await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('external_id', subscriptionId);
    }
  }

  return NextResponse.json({ received: true });
}
