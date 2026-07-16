import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const externalId = payload.payment_id || payload.id;
  if (externalId) {
    const { data: existing } = await supabase.from('payment_requests').select('id').eq('external_id', externalId).limit(1);
    if (existing && existing.length) return NextResponse.json({ received: true });
  }

  await supabase.from('webhook_deliveries').insert({ provider: 'khipu', endpoint: '/api/payments/webhook/khipu', payload, headers: {}, status: 'pending' });

  return NextResponse.json({ received: true });
}
