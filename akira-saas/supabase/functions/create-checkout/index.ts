// ============================================================================
//  Edge Function: create-checkout
//  Crea una sesión de Stripe Checkout para cobrar una factura y devuelve la URL
//  de pago. La llama el dueño desde la web (botón "Cobrar"), autenticado.
//
//  Secretos: STRIPE_SECRET_KEY. (SUPABASE_URL / SUPABASE_ANON_KEY los inyecta
//  Supabase.) Desplegar normal (con verificación de JWT).
// ============================================================================
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  // Cliente con el token del usuario: RLS garantiza que solo ve SUS facturas.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { invoice_id, return_path } = await req.json().catch(() => ({}))
  if (!invoice_id) return json({ error: 'falta invoice_id' }, 400)
  // Ruta de retorno segura (solo rutas internas que empiezan por "/").
  const retPath = typeof return_path === 'string' && return_path.startsWith('/') ? return_path : '/invoices'

  const { data: inv, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, status, clients(name, company, email)')
    .eq('id', invoice_id)
    .single()

  if (error || !inv) return json({ error: 'factura no encontrada' }, 404)
  if (inv.status === 'paid') return json({ error: 'la factura ya está pagada' }, 400)
  if (!(Number(inv.total) > 0)) return json({ error: 'importe no válido' }, 400)

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
  const origin = req.headers.get('origin') ?? 'https://akira-os-dun.vercel.app'
  const client = (inv as any).clients

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
      success_url: `${origin}${retPath}?paid=1`,
      cancel_url: `${origin}${retPath}`,
    })
    return json({ url: session.url })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
