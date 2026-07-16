import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const payload = await request.json();
  // Mercado Pago webhooks send { type, data: { id } }
  const topic = payload.type || payload.topic || null;
  const id = payload.data?.id || payload.resource?.id || payload.id;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) return NextResponse.json({ error: 'Missing Mercado Pago token' }, { status: 500 });

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`MP fetch failed: ${res.status} ${txt}`);
    }
    const payment = await res.json();

    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

    // attempt to find payment_request by external id or custom id
    const externalId = payment.id || payment.order?.id || payment.collection_id;
    const custom = payment.metadata?.custom_id || payment.external_reference || payment.order?.type;

    const key = custom || externalId;
    if (!key) return NextResponse.json({ error: 'Could not determine payment_request id' }, { status: 400 });

    const status = payment.status || payment.status_detail || payment.collection_status;

    if (status === 'approved' || status === 'paid') {
      await supabase.from('payment_requests').update({ status: 'paid', provider: 'mercadopago', external_id: externalId, updated_at: new Date().toISOString() }).eq('id', key);
      await supabase.from('licenses').insert({ user_id: payment.payer?.id || null, payment_request_id: key, product_key: `CALJOB-${key}`, status: 'active', issued_at: new Date().toISOString() });
    } else if (status === 'cancelled' || status === 'rejected' || status === 'refunded') {
      await supabase.from('payment_requests').update({ status: 'failed', provider: 'mercadopago', updated_at: new Date().toISOString() }).eq('id', key);
      await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('payment_request_id', key);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
