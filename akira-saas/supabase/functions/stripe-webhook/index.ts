// ============================================================================
//  Edge Function: stripe-webhook
//  Recibe eventos de Stripe. Al completarse un pago (checkout.session.completed)
//  marca la factura correspondiente como 'paid'.
//
//  Secretos: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
//  IMPORTANTE: desplegar SIN verificación de JWT (Stripe no envía token):
//      supabase functions deploy stripe-webhook --no-verify-jwt
// ============================================================================
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('falta firma', { status: 400 })

  const body = await req.text()
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch (e) {
    return new Response(`Webhook Error: ${(e as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const invoiceId = session.metadata?.invoice_id
    if (invoiceId) {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      await admin
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
