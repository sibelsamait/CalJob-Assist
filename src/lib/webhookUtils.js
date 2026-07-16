import { getSupabaseServer } from './supabaseServer';

export async function processPaymentEvent(supabase, provider, payload) {
  // Heuristic attempts to find payment_request and map to license updates.
  // Returns { handled: boolean, reason: string }
  try {
    const externalId = payload.id || payload.payment_id || payload.external_id || payload.resource?.id || payload.data?.id || payload.transaction_id || null;
    const custom = payload.metadata?.custom_id || payload.custom_id || payload.purchase_units?.[0]?.custom_id || null;

    const key = custom || externalId;
    if (!key) return { handled: false, reason: 'no-key' };

    // Attempt to fetch payment_request
    const { data: pr } = await supabase.from('payment_requests').select('*').eq('id', key).limit(1).maybeSingle();
    let requestId = pr?.id;
    if (!requestId) {
      // try external_id match
      const { data: pr2 } = await supabase.from('payment_requests').select('*').eq('external_id', externalId).limit(1).maybeSingle();
      requestId = pr2?.id;
    }

    if (!requestId) return { handled: false, reason: 'no-payment-request' };

    // Map status
    const status = (payload.status || payload.collection_status || payload.payment_status || payload.transaction_status || '').toString().toLowerCase();
    if (status.includes('paid') || status.includes('approved') || status.includes('completed') || status.includes('authorized')) {
      await supabase.from('payment_requests').update({ status: 'paid', provider, external_id: externalId || null, updated_at: new Date().toISOString() }).eq('id', requestId);
      await supabase.from('licenses').insert({ user_id: payload.payer?.id || null, payment_request_id: requestId, product_key: `CALJOB-${requestId}`, status: 'active', issued_at: new Date().toISOString(), metadata: { provider } });
      return { handled: true, reason: 'paid' };
    }

    if (status.includes('cancel') || status.includes('reject') || status.includes('failed') || status.includes('refun')) {
      await supabase.from('payment_requests').update({ status: 'failed', provider, updated_at: new Date().toISOString() }).eq('id', requestId);
      await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('payment_request_id', requestId);
      return { handled: true, reason: 'failed' };
    }

    return { handled: false, reason: 'unmapped-status' };
  } catch (err) {
    return { handled: false, reason: 'error', error: err.message };
  }
}

export async function logAudit(supabase, user_id, action, entity, entity_id, metadata) {
  try {
    await supabase.from('audit_log').insert({ user_id, action, entity, entity_id, metadata });
  } catch (e) {
    // ignore
  }
}
