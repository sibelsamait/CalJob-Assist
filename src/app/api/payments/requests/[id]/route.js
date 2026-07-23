import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

async function getAuthorizedRequest(id) {
  const authClient = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const supabase = getSupabaseServer();
  if (!supabase) return { error: NextResponse.json({ error: 'Supabase server client could not be initialized' }, { status: 500 }) };

  const { data, error } = await supabase.from('payment_requests').select('*').eq('id', id).eq('user_id', user.id).single();
  if (error || !data) return { error: NextResponse.json({ error: 'Payment request not found' }, { status: 404 }) };
  return { data, supabase };
}

export async function GET(_request, { params }) {
  const result = await getAuthorizedRequest(params.id);
  if (result.error) return result.error;
  return NextResponse.json({ request: result.data });
}

export async function PATCH(request, { params }) {
  const result = await getAuthorizedRequest(params.id);
  if (result.error) return result.error;

  const payload = await request.json();
  const allowedMethods = ['webpay_plus', 'mercado_pago', 'flow', 'khipu', 'paypal', 'bank_transfer', 'purchase_order'];
  if (!allowedMethods.includes(payload.paymentMethod)) {
    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
  }

  const { data, error } = await result.supabase
    .from('payment_requests')
    .update({ payment_method: payload.paymentMethod, updated_at: new Date().toISOString() })
    .eq('id', result.data.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message || 'Unable to update payment request' }, { status: 500 });
  return NextResponse.json({ request: data });
}