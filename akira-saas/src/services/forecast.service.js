import { supabase } from '@/lib/supabase'

function calcMonthlyValue(price, period) {
  var p = Number(price) || 0
  if (period === 'yearly')    return p / 12
  if (period === 'quarterly') return p / 3
  if (period === 'weekly')    return p * 4.33
  return p
}

export async function getForecast() {
  var results = await Promise.allSettled([
    // Presupuestos aceptados que todavia no se convirtieron en factura
    supabase
      .from('commercial_documents')
      .select('id, quote_number, total, client_id, clients(id, name, company)')
      .eq('document_type', 'quote')
      .eq('status', 'accepted')
      .eq('archived', false)
      .is('invoice_number', null),
    // Suscripciones activas, para el MRR garantizado
    supabase
      .from('subscriptions')
      .select('id, name, price, period, client_id, clients(id, name, company)')
      .eq('status', 'active')
      .eq('archived', false),
    // Facturas ya emitidas y pendientes de cobro (draft o sent), para saber cuanto falta por entrar YA facturado
    supabase
      .from('commercial_documents')
      .select('id, invoice_number, total, due_date, client_id, clients(id, name, company)')
      .eq('document_type', 'invoice')
      .in('status', ['draft', 'sent'])
      .eq('archived', false),
  ])

  function safe(r) { return r.status === 'fulfilled' && !r.value.error ? (r.value.data || []) : [] }

  var acceptedQuotes  = safe(results[0])
  var activeSubs      = safe(results[1])
  var pendingInvoices = safe(results[2])

  var quotesTotal   = acceptedQuotes.reduce(function(s, q) { return s + Number(q.total) }, 0)
  var mrr           = activeSubs.reduce(function(s, sub) { return s + calcMonthlyValue(sub.price, sub.period) }, 0)
  var pendingTotal  = pendingInvoices.reduce(function(s, inv) { return s + Number(inv.total) }, 0)

  var forecastNextMonth = mrr + quotesTotal

  return {
    mrr: mrr,
    quotesTotal: quotesTotal,
    pendingTotal: pendingTotal,
    forecastNextMonth: forecastNextMonth,
    acceptedQuotes: acceptedQuotes,
    activeSubs: activeSubs,
    pendingInvoices: pendingInvoices,
  }
}