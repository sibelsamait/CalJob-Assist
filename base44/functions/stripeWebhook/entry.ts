import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature error:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const plan = event.data?.object?.metadata?.plan || 'personal';

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout completed:', session.id, 'plan:', plan);

      await base44.asServiceRole.entities.Subscription.create({
        user_email: session.customer_email || '',
        plan,
        account_type: plan === 'enterprise' ? 'enterprise' : plan === 'team' ? 'team' : 'personal',
        status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        seats: plan === 'team' ? 10 : plan === 'enterprise' ? 100 : 1,
      });

      await base44.asServiceRole.entities.AuditLog.create({
        action: 'subscription_created',
        entity_type: 'Subscription',
        user_email: session.customer_email || 'unknown',
        details: { plan, session_id: session.id },
        timestamp: new Date().toISOString(),
      });
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      console.log('Subscription updated:', sub.id, 'status:', sub.status);

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id,
      });
      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      console.log('Subscription canceled:', sub.id);

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id,
      });
      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'canceled',
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log('Payment failed for subscription:', invoice.subscription);

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: invoice.subscription,
      });
      if (subs && subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'past_due',
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});