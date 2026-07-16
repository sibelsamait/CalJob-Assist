import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// This endpoint receives Webpay/Transbank notifications.
// It attempts to validate the notification using the official `transbank-sdk` when
// credentials are provided. If the SDK is unavailable or validation fails, it
// falls back to a conservative status mapping. In production ensure SDK validation succeeds.
export async function POST(request) {
  const payload = await request.json();
  const { requestId, status, externalId } = payload;

  if (!requestId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });

  let finalStatus = status;

  // Try to validate with Transbank SDK when available and configured.
  try {
    // Dynamically import to avoid build-time issues when SDK isn't present.
    const transbank = await import('transbank-sdk').catch(() => null);
    if (transbank && (process.env.WEBPAY_API_KEY || process.env.WEBPAY_COMMERCE_CODE)) {
      const WebpayModule = transbank.Webpay || transbank.WebpayPlus || transbank;
      if (WebpayModule && typeof WebpayModule.Transaction === 'function') {
        const txnClient = new WebpayModule.Transaction({
          commerceCode: process.env.WEBPAY_COMMERCE_CODE,
          apiKey: process.env.WEBPAY_API_KEY,
          environment: process.env.WEBPAY_ENV || 'PRODUCTION',
        });

        // The payload may include different token names depending on integration.
        const token = payload.token || payload.token_ws || externalId;
        if (token && typeof txnClient.status === 'function') {
          const result = await txnClient.status(token).catch(() => null);
          // The SDK returns different shapes across versions; be defensive.
          if (result && (result.status || result.responseCode || result.detail)) {
            // Heuristic: consider responseCode === 0 or status === 'AUTHORIZED' as paid
            const code = result.responseCode ?? (result.detail?.[0]?.responseCode);
            const sdkStatus = result.status ?? (code === 0 ? 'AUTHORIZED' : undefined);
            if (sdkStatus && ['AUTHORIZED', 'SUCCESS', 'OK', 'COMPLETED'].includes(sdkStatus)) {
              finalStatus = 'PAID';
            } else if (code !== undefined && code !== 0) {
              finalStatus = 'FAILED';
            }
          }
        }
      }
    }
  } catch (err) {
    // Do not block processing if SDK validation fails; log for diagnostics.
    // eslint-disable-next-line no-console
    console.error('Transbank SDK validation failed', err?.message || err);
  }

  // Map provider status to internal statuses
  const paidStates = ['AUTHORIZED', 'SUCCESS', 'OK', 'COMPLETED', 'PAID'];
  const failedStates = ['FAILED', 'REJECTED', 'DENIED'];
  const newStatus = paidStates.includes(finalStatus) ? 'paid' : (failedStates.includes(finalStatus) ? 'failed' : 'pending');

  await supabase.from('payment_requests').update({ status: newStatus, provider: 'webpay', external_id: externalId || null, updated_at: new Date().toISOString() }).eq('id', requestId);

  if (newStatus === 'paid') {
    await supabase.from('licenses').insert({ user_id: null, payment_request_id: requestId, product_key: `CALJOB-${requestId}`, status: 'active', issued_at: new Date().toISOString() });
  } else if (newStatus === 'failed') {
    await supabase.from('licenses').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('payment_request_id', requestId);
  }

  return NextResponse.json({ received: true });
}
