import Stripe from 'npm:stripe@17.7.0';

const PRICE_IDS = {
  personal: 'price_1TtcqDCzDcFiLWiCeRjClMyJ',
  team: 'price_1TtcqDCzDcFiLWiCrn4i94cS',
  enterprise: 'price_1TtcqDCzDcFiLWiCCTyQCKQB',
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { plan, success_url, cancel_url, customer_email } = await req.json();

    if (!plan || !PRICE_IDS[plan]) {
      return Response.json({ error: 'Plan inválido. Opciones: personal, team, enterprise' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      customer_email: customer_email || undefined,
      success_url: success_url || 'https://caljobassist.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancel_url || 'https://caljobassist.com/pricing',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
      },
      subscription_data: {
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          plan,
        },
      },
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});