import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;

function backoffSeconds(attempts) {
  // exponential backoff: 30s, 60s, 180s, 600s...
  const base = 30;
  return Math.floor(base * Math.pow(2, Math.max(0, attempts - 1)));
}

export async function POST(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!process.env.WEBHOOK_RETRY_TOKEN || token !== process.env.WEBHOOK_RETRY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  // Select pending deliveries with attempts < MAX_ATTEMPTS
  const { data: pending } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('status', 'pending')
    .lt('attempts', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(50);

  if (!pending || pending.length === 0) return NextResponse.json({ processed: 0 });

  let processed = 0;

  for (const d of pending) {
    try {
      // Check simple backoff: skip if last attempt too recent
      if (d.attempts && d.attempts > 0 && d.updated_at) {
        const last = new Date(d.updated_at).getTime();
        const wait = backoffSeconds(d.attempts) * 1000;
        if (Date.now() - last < wait) continue;
      }

      const res = await fetch(d.endpoint, {
        method: 'POST',
        headers: d.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(d.payload),
        // timeout handled by platform; do not block
      });

      const now = new Date().toISOString();
      if (res.ok) {
        await supabase.from('webhook_deliveries').update({ status: 'delivered', attempts: d.attempts + 1, delivered_at: now, updated_at: now }).eq('id', d.id);
        processed += 1;
        continue;
      }

      const text = await res.text().catch(() => 'no-body');
      await supabase.from('webhook_deliveries').update({ attempts: d.attempts + 1, last_error: `status:${res.status} body:${text}`, updated_at: now }).eq('id', d.id);
    } catch (err) {
      await supabase.from('webhook_deliveries').update({ attempts: d.attempts + 1, last_error: err.message, updated_at: new Date().toISOString() }).eq('id', d.id);
    }
  }

  return NextResponse.json({ processed });
}
