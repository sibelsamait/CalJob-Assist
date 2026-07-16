import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json();
  const { provider, endpoint, payload, headers } = body;
  if (!provider || !endpoint) return NextResponse.json({ error: 'Missing provider or endpoint' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  const { data, error } = await supabase.from('webhook_deliveries').insert([{ provider, endpoint, payload, headers }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
