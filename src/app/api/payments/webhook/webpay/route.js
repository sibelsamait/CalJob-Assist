import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// This endpoint is a simple receiver for Webpay/Transbank notifications.
// For production, use Transbank SDK to validate signatures and details.
export async function POST(request) {
  const payload = await request.json();
  const { requestId, status, externalId } = payload;

  if (!requestId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  // Map provider status to internal statuses (use Transbank SDK in production for signature validation)
  const paidStates = ['AUTHORIZED', 'SUCCESS', 'OK', 'COMPLETED'];
  const failedStates = ['FAILED', 'REJECTED', 'DENIED'];
  const newStatus = paidStates.includes(status) ? 'paid' : (failedStates.includes(status) ? 'failed' : 'pending');

  await supabase.from('payment_requests').update({ status: newStatus, provider: 'webpay', external_id: externalId || null, updated_at: new Date().toISOString() }).eq('id', requestId);

  if (newStatus === 'paid') {
    await supabase.from('licenses').insert({ user_id: null, payment_request_id: requestId, product_key: `CALJOB-${requestId}`, status: 'active', issued_at: new Date().toISOString() });
  } else if (newStatus === 'failed') {
    await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('payment_request_id', requestId);
  }

  return NextResponse.json({ received: true });
}
