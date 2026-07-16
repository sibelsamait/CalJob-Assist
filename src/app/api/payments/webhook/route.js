import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing webhook signature or secret' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-08-01',
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const supabaseServer = getSupabaseServer();
    const session = event.data.object;
    const paymentRequestId = session.metadata?.payment_request_id;
    const paymentIntentId = session.payment_intent;

    if (paymentRequestId) {
      await supabaseServer
        .from('payment_requests')
        .update({
          status: 'completed',
          external_id: paymentIntentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRequestId);

      const profile = await supabaseServer.from('profiles').select('company_id').eq('id', session.metadata?.user_id).single();
      const companyId = profile.data?.company_id || null;

      if (companyId) {
        await supabaseServer.from('licenses').insert([{
          company_id: companyId,
          user_id: session.metadata?.user_id,
          plan: session.metadata?.plan_key?.toUpperCase() || 'PERSONAL',
          status: 'ACTIVE',
          starts_at: new Date().toISOString(),
          ends_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          metadata: {
            payment_request_id: paymentRequestId,
            payment_intent_id: paymentIntentId,
          },
        }]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
