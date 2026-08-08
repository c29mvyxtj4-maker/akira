// ============================================================================
//  Edge Function: create-checkout
//  Crea una sesión de Stripe Checkout para cobrar una factura y devuelve la URL
//  de pago. La llama el dueño desde la web (botón "Cobrar"), autenticado.
//
//  Secretos: STRIPE_SECRET_KEY. (SUPABASE_URL / SUPABASE_ANON_KEY los inyecta
//  Supabase.) Opcional: ALLOWED_ORIGINS (lista separada por comas).
//  Desplegar normal (con verificación de JWT).
// ============================================================================
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { rateLimit } from '../_shared/rateLimit.ts'

// Orígenes permitidos para CORS. Configurable con el secret ALLOWED_ORIGINS.
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ??
  'https://akira-os-dun.vercel.app,http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean)

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors)

  const authHeader = req.headers.get('Authorization') ?? ''
  // Cliente con el token del usuario: RLS garantiza que solo ve SUS facturas.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  // Identificar al usuario para el rate-limit (y confirmar que está autenticado).
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return json({ error: 'no autenticado' }, 401, cors)
  const rl = rateLimit(`checkout:${userId}`, 10, 60_000)
  if (rl.limited) {
    return new Response(
      JSON.stringify({ error: 'demasiadas peticiones, espera un momento' }),
      { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  const { invoice_id, return_path } = await req.json().catch(() => ({}))
  if (!invoice_id) return json({ error: 'falta invoice_id' }, 400, cors)
  // Ruta de retorno segura (solo rutas internas que empiezan por "/").
  const retPath = typeof return_path === 'string' && return_path.startsWith('/') ? return_path : '/documents'

  // Las facturas actuales viven en commercial_documents (document_type='invoice').
  // Buscamos ahí primero y, si no, en la tabla legacy 'invoices'.
  const SEL = 'id, invoice_number, total, status, clients(name, company, email)'
  let inv: { id: string; invoice_number: string; total: number; status: string; clients?: { email?: string } } | null = null
  {
    const r = await supabase.from('commercial_documents').select(SEL)
      .eq('id', invoice_id).eq('document_type', 'invoice').maybeSingle()
    if (r.data) inv = r.data as typeof inv
  }
  if (!inv) {
    const r = await supabase.from('invoices').select(SEL).eq('id', invoice_id).maybeSingle()
    if (r.data) inv = r.data as typeof inv
  }

  if (!inv) return json({ error: 'factura no encontrada' }, 404, cors)
  if (inv.status === 'paid') return json({ error: 'la factura ya está pagada' }, 400, cors)
  if (!(Number(inv.total) > 0)) return json({ error: 'importe no válido' }, 400, cors)

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
  const returnBase = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  const client = (inv as { clients?: { email?: string } }).clients

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Factura ${inv.invoice_number}` },
          unit_amount: Math.round(Number(inv.total) * 100),
        },
        quantity: 1,
      }],
      customer_email: client?.email ?? undefined,
      metadata: { invoice_id: inv.id },
      // Propagar invoice_id al PaymentIntent para que reembolsos/disputas
      // (que llegan como charge.*) puedan resolver la factura.
      payment_intent_data: { metadata: { invoice_id: inv.id } },
      success_url: `${returnBase}${retPath}?paid=1`,
      cancel_url: `${returnBase}${retPath}`,
    })
    return json({ url: session.url }, 200, cors)
  } catch (e) {
    return json({ error: (e as Error).message }, 500, cors)
  }
})
