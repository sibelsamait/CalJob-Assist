import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  const { data: delivery, error } = await supabase.from('webhook_deliveries').select('*').eq('id', id).single();
  if (error || !delivery) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });

  try {
    const res = await fetch(delivery.endpoint, {
      method: 'POST',
      headers: delivery.headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery.payload),
    });

    const now = new Date().toISOString();
    if (res.ok) {
      await supabase.from('webhook_deliveries').update({ status: 'delivered', attempts: delivery.attempts + 1, delivered_at: now, updated_at: now }).eq('id', id);
      return NextResponse.json({ delivered: true });
    }

    const text = await res.text();
    await supabase.from('webhook_deliveries').update({ attempts: delivery.attempts + 1, last_error: text, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ delivered: false, status: res.status, body: text }, { status: 502 });
  } catch (err) {
    await supabase.from('webhook_deliveries').update({ attempts: delivery.attempts + 1, last_error: err.message, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
