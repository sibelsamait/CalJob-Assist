import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  const payload = await request.json();
  const { requestId, provider, status, externalId } = payload;

  if (!requestId || !provider || !status) {
    return NextResponse.json({ error: 'Missing webhook payload fields' }, { status: 400 });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server client could not be initialized' }, { status: 500 });
  }

  const { data: paymentRequest, error: fetchError } = await supabaseServer
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !paymentRequest) {
    return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
  }

  const updatePayload = {
    status,
    provider,
    external_id: externalId || paymentRequest.external_id,
    updated_at: new Date().toISOString(),
  };

  await supabaseServer.from('payment_requests').update(updatePayload).eq('id', requestId);

  if (status === 'paid') {
    await supabaseServer.from('licenses').insert({
      user_id: paymentRequest.user_id,
      payment_request_id: requestId,
      product_key: `CALJOB-${requestId}`,
      status: 'active',
      issued_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
