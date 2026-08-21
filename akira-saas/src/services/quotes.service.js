import { supabase } from '@/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export var QUOTE_STATUS = {
  draft:    { label: 'Borrador',   color: '#64748b' },
  sent:     { label: 'Enviado',    color: '#3b82f6' },
  accepted: { label: 'Aceptado',   color: '#22c55e' },
  rejected: { label: 'Rechazado',  color: '#ef4444' },
  expired:  { label: 'Caducado',   color: '#f59e0b' },
}

function calcTotals(items, taxRate) {
  var subtotal = (items || []).reduce(function(s, it) {
    return s + (Number(it.quantity) || 0) * (Number(it.price) || 0)
  }, 0)
  var taxAmount = subtotal * ((Number(taxRate) || 0) / 100)
  return {
    subtotal:  Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total:     Math.round((subtotal + taxAmount) * 100) / 100,
  }
}

export async function getQuotes() {
  var res = await supabase
    .from('quotes')
    .select('*, clients(id, name, company)')
    .eq('archived', false)
    .order('issue_date', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function getQuoteById(id) {
  var res = await supabase
    .from('quotes')
    .select('*, clients(id, name, company, email, phone)')
    .eq('id', id)
    .single()
  if (res.error) throw res.error
  return res.data
}

export async function createQuote(form) {
  var ownerId = await uid()

  var csRes = await supabase.from('company_settings').select('*').eq('owner_id', ownerId).single()
  if (csRes.error) throw csRes.error
  var cs = csRes.data

  var totals = calcTotals(form.items, form.tax_rate)
  var quoteNumber = (cs.quote_prefix || 'PRES') + '-' + String(cs.next_quote_number || 1).padStart(3, '0')

  var res = await supabase.from('quotes').insert({
    owner_id:     ownerId,
    client_id:    form.client_id || null,
    quote_number: quoteNumber,
    issue_date:   form.issue_date || new Date().toISOString().split('T')[0],
    valid_until:  form.valid_until || null,
    items:        form.items || [],
    tax_rate:     Number(form.tax_rate) || 0,
    subtotal:     totals.subtotal,
    tax_amount:   totals.taxAmount,
    total:        totals.total,
    status:       'draft',
    notes:        form.notes || null,
    archived:     false,
  }).select('*, clients(id, name, company)').single()

  if (res.error) throw res.error

  await supabase.from('company_settings').update({ next_quote_number: (cs.next_quote_number || 1) + 1 }).eq('owner_id', ownerId)

  return res.data
}

export async function updateQuote(id, form) {
  var totals = calcTotals(form.items, form.tax_rate)
  var res = await supabase.from('quotes').update({
    client_id:   form.client_id || null,
    issue_date:  form.issue_date || null,
    valid_until: form.valid_until || null,
    items:       form.items || [],
    tax_rate:    Number(form.tax_rate) || 0,
    subtotal:    totals.subtotal,
    tax_amount:  totals.taxAmount,
    total:       totals.total,
    status:      form.status || 'draft',
    notes:       form.notes || null,
  }).eq('id', id).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function updateQuoteStatus(id, status) {
  var res = await supabase.from('quotes').update({ status: status }).eq('id', id).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveQuote(id) {
  var res = await supabase.from('quotes').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

// Crea una factura en borrador a partir de un presupuesto aceptado, con las mismas lineas
export async function convertQuoteToInvoice(quoteId) {
  var ownerId = await uid()
  var q = await getQuoteById(quoteId)

  var csRes = await supabase.from('company_settings').select('*').eq('owner_id', ownerId).single()
  if (csRes.error) throw csRes.error
  var cs = csRes.data

  var invoiceNumber = (cs.invoice_prefix || 'FAC') + '-' + String(cs.next_invoice_number || 1).padStart(3, '0')

  var insRes = await supabase.from('invoices').insert({
    owner_id:      ownerId,
    client_id:     q.client_id,
    invoice_number: invoiceNumber,
    issue_date:    new Date().toISOString().split('T')[0],
    due_date:      null,
    items:         q.items,
    tax_rate:      q.tax_rate,
    subtotal:      q.subtotal,
    tax_amount:    q.tax_amount,
    total:         q.total,
    status:        'draft',
    notes:         'Generada a partir del presupuesto ' + q.quote_number,
    archived:      false,
  }).select().single()
  if (insRes.error) throw insRes.error

  await supabase.from('company_settings').update({ next_invoice_number: (cs.next_invoice_number || 1) + 1 }).eq('owner_id', ownerId)
  await supabase.from('quotes').update({ converted_invoice_id: insRes.data.id }).eq('id', quoteId)

  return insRes.data
}
