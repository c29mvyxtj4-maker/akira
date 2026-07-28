// ============================================================================
//  Edge Function: send-invoice
//  Envía por email una factura al cliente. La llama el owner (autenticado)
//  cuando cambia una factura de borrador a "enviada".
//
//  Secretos: RESEND_API_KEY, RESEND_FROM (opcional).
//  SUPABASE_URL / SUPABASE_ANON_KEY los inyecta Supabase.
//  Desplegar normal (con verificación de JWT).
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { rateLimit } from '../_shared/rateLimit.ts'

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
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function eur(n: number) {
  return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return d }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors)

  const authHeader = req.headers.get('Authorization') ?? ''
  // Cliente con el token del usuario: RLS garantiza que solo accede a SUS facturas.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return json({ error: 'no autenticado' }, 401, cors)

  const rl = rateLimit(`send-invoice:${userId}`, 20, 60_000)
  if (rl.limited) return json({ error: 'demasiadas peticiones, espera un momento' }, 429, cors)

  const { invoice_id } = await req.json().catch(() => ({}))
  if (!invoice_id) return json({ error: 'falta invoice_id' }, 400, cors)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM') ?? 'AKIRA <onboarding@resend.dev>'
  if (!resendKey) return json({ error: 'falta RESEND_API_KEY' }, 500, cors)

  const { data: inv, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, issue_date, due_date, notes, clients(name, company, email)')
    .eq('id', invoice_id)
    .single()

  if (error || !inv) return json({ error: 'factura no encontrada' }, 404, cors)

  const client = (inv as { clients?: { name?: string; company?: string; email?: string } }).clients
  const to = client?.email
  if (!to) return json({ error: 'el cliente no tiene email' }, 400, cors)

  const clientName = client?.name || client?.company || 'cliente'
  const num = inv.invoice_number || 'sin número'
  const subject = `Factura ${num}`
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#1a1517">
      <p>Hola ${clientName},</p>
      <p>Adjuntamos los datos de tu factura <strong>${num}</strong>.</p>
      <table style="margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#877f82">Importe</td><td style="padding:4px 0;font-weight:700">${eur(Number(inv.total))}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#877f82">Emisión</td><td style="padding:4px 0">${fmtDate(inv.issue_date)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#877f82">Vencimiento</td><td style="padding:4px 0">${fmtDate(inv.due_date)}</td></tr>
      </table>
      ${inv.notes ? `<p style="color:#555">${String(inv.notes).replace(/</g, '&lt;')}</p>` : ''}
      <p>Gracias por tu confianza.</p>
    </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) return json({ error: `Resend ${res.status}: ${await res.text()}` }, 502, cors)
    return json({ sent: true, to }, 200, cors)
  } catch (e) {
    return json({ error: (e as Error).message }, 500, cors)
  }
})
