import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Placeholder Flow webhook receiver. Implement provider-specific signature
// verification and event mapping in production.
export async function POST(request) {
  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  // Idempotency: ignore duplicate external ids
  const externalId = payload.payment_id || payload.id;
  if (externalId) {
    const { data: existing } = await supabase.from('payment_requests').select('id').eq('external_id', externalId).limit(1);
    if (existing && existing.length) return NextResponse.json({ received: true });
  }
  // Record webhook for monitoring
  await supabase.from('webhook_deliveries').insert({ provider: 'flow', endpoint: '/api/payments/webhook/flow', payload, headers: {}, status: 'pending' });

  // Try to process payment event heuristically
  try {
    const { processPaymentEvent } = await import('@/lib/webhookUtils');
    const result = await processPaymentEvent(supabase, 'flow', payload);
    if (result.handled) return NextResponse.json({ received: true, result });
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ received: true });
}
