import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  const nowIso = new Date().toISOString();

  // Expire licenses that ended before now
  const { data: expired, error } = await supabase
    .from('licenses')
    .select('id, user_id, payment_request_id')
    .lt('ends_at', nowIso)
    .eq('status', 'active');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (expired && expired.length) {
    const ids = expired.map((r) => r.id);
    await supabase.from('licenses').update({ status: 'expired', updated_at: nowIso }).in('id', ids);

    // Optionally mark payment_requests as expired
    const prIds = expired.map((r) => r.payment_request_id).filter(Boolean);
    if (prIds.length) {
      await supabase.from('payment_requests').update({ status: 'expired', updated_at: nowIso }).in('id', prIds);
    }
  }

  return NextResponse.json({ processed: expired?.length || 0 });
}
