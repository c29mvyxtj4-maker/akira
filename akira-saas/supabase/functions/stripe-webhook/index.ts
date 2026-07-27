// ============================================================================
//  Edge Function: stripe-webhook
//  Recibe eventos de Stripe y actualiza el estado de las facturas.
//
//  Eventos manejados:
//    - checkout.session.completed        → factura 'paid'
//    - checkout.session.async_payment_failed / .expired → sin cambio (log)
//    - charge.refunded                   → factura 'refunded'
//    - charge.dispute.created            → factura 'disputed'
//
//  Idempotencia: cada event.id se registra en la tabla stripe_events; si llega
//  repetido (Stripe reintenta) se ignora. Ver migración 20260727000003.
//
//  Secretos: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
//  IMPORTANTE: desplegar SIN verificación de JWT (Stripe no envía token):
//      supabase functions deploy stripe-webhook --no-verify-jwt
// ============================================================================
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

async function setInvoiceStatus(invoiceId: string, status: string) {
  await admin.from('invoices').update({ status }).eq('id', invoiceId)
}

// Devuelve el invoice_id asociado a un charge/dispute vía su PaymentIntent.
async function invoiceIdFromCharge(stripe: Stripe, charge: Stripe.Charge): Promise<string | null> {
  if (charge.metadata?.invoice_id) return charge.metadata.invoice_id
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!piId) return null
  const pi = await stripe.paymentIntents.retrieve(piId)
  return pi.metadata?.invoice_id ?? null
}

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

  // ── Idempotencia: si ya procesamos este evento, salir con 200 ──────────────
  const { error: insErr } = await admin
    .from('stripe_events')
    .insert({ id: event.id, type: event.type })
  if (insErr) {
    // Violación de PK (23505) = evento duplicado → ya procesado, OK.
    if ((insErr as { code?: string }).code === '23505') {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    // Otro error de BD: devolver 500 para que Stripe reintente.
    return new Response(`DB error: ${insErr.message}`, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoice_id
        if (invoiceId) await setInvoiceStatus(invoiceId, 'paid')
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const invoiceId = await invoiceIdFromCharge(stripe, charge)
        if (invoiceId) await setInvoiceStatus(invoiceId, 'refunded')
        break
      }
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id
        const charge = await stripe.charges.retrieve(chargeId)
        const invoiceId = await invoiceIdFromCharge(stripe, charge)
        if (invoiceId) await setInvoiceStatus(invoiceId, 'disputed')
        break
      }
      // Pago asíncrono fallido / sesión expirada: no cambiamos estado, solo log.
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        console.warn(`Stripe ${event.type}:`, (event.data.object as { id?: string }).id)
        break
      default:
        // Evento no manejado: lo dejamos registrado en stripe_events y seguimos.
        break
    }
  } catch (e) {
    // Si algo falla al procesar, borramos el registro de idempotencia para
    // permitir que el reintento de Stripe vuelva a intentarlo.
    await admin.from('stripe_events').delete().eq('id', event.id)
    return new Response(`Handler error: ${(e as Error).message}`, { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
