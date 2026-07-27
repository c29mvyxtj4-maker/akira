// ============================================================================
//  Edge Function: invoice-reminders
//  Envía recordatorios por email de facturas vencidas usando Resend.
//
//  Lógica:
//   - Busca facturas con status = 'sent', no archivadas, cuya due_date ya pasó.
//   - Evita spam: solo recuerda si no se ha enviado en los últimos 7 días
//     (columna invoices.last_reminder_at).
//   - Envía email al cliente vía Resend y actualiza last_reminder_at.
//
//  Requisitos (ver README.md de esta carpeta):
//   - Columna invoices.last_reminder_at (timestamptz)
//   - Secret RESEND_API_KEY
//   - Secret RESEND_FROM  (p.ej. "AKIRA <facturas@tudominio.com>")
//   - Secret CRON_SECRET  (cadena aleatoria para proteger el endpoint)
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase.
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { rateLimit, clientIp } from '../_shared/rateLimit.ts'

const DAYS_BETWEEN_REMINDERS = 7

function eur(n: number) {
  return (Number(n) || 0).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '€'
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return d
  }
}

function buildEmail(inv: any, clientName: string) {
  const total = eur(inv.total)
  const due = fmtDate(inv.due_date)
  const num = inv.invoice_number || 'sin número'
  const subject = `Recordatorio: factura ${num} pendiente de pago`
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#1a1517">
      <p>Hola ${clientName},</p>
      <p>Te escribimos para recordarte que la factura <strong>${num}</strong>,
      con vencimiento el <strong>${due}</strong>, sigue pendiente de pago.</p>
      <table style="margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#877f82">Importe</td><td style="padding:4px 0;font-weight:700">${total}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#877f82">Vencimiento</td><td style="padding:4px 0">${due}</td></tr>
      </table>
      <p>Si ya has realizado el pago, ignora este mensaje. Gracias.</p>
    </div>`
  return { subject, html }
}

Deno.serve(async (req: Request) => {
  // Rate-limit por IP ANTES de validar el secreto: frena la fuerza bruta del
  // CRON_SECRET. El cron legítimo llama 1 vez/día, así que no le afecta.
  const rl = rateLimit(`reminders:${clientIp(req)}`, 12, 60_000)
  if (rl.limited) {
    return new Response(JSON.stringify({ error: 'demasiadas peticiones' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfterSec) },
    })
  }

  // Protección: exige el header con el secreto de cron.
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response(JSON.stringify({ error: 'no autorizado' }), { status: 401 })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('RESEND_FROM') ?? 'AKIRA <onboarding@resend.dev>'
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'falta RESEND_API_KEY' }), { status: 500 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const nowIso = new Date().toISOString()
  const cutoffIso = new Date(Date.now() - DAYS_BETWEEN_REMINDERS * 86400000).toISOString()

  // Facturas vencidas, enviadas, sin recordatorio reciente.
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, due_date, last_reminder_at, clients(name, company, email)')
    .eq('status', 'sent')
    .eq('archived', false)
    .lt('due_date', nowIso)
    .or(`last_reminder_at.is.null,last_reminder_at.lt.${cutoffIso}`)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  let skipped = 0
  const failures: string[] = []

  for (const inv of invoices ?? []) {
    const client = (inv as any).clients
    const to = client?.email
    if (!to) { skipped++; continue }

    const clientName = client.company || client.name || 'cliente'
    const { subject, html } = buildEmail(inv, clientName)

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html }),
      })
      if (!res.ok) {
        failures.push(`${inv.invoice_number}: ${res.status} ${await res.text()}`)
        continue
      }
      await supabase.from('invoices').update({ last_reminder_at: nowIso }).eq('id', inv.id)
      sent++
    } catch (e) {
      failures.push(`${inv.invoice_number}: ${(e as Error).message}`)
    }
  }

  return new Response(
    JSON.stringify({ candidates: invoices?.length ?? 0, sent, skipped, failures }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
