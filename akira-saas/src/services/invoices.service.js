import { supabase } from '@/shared/lib/supabase'
import { getActiveOrgId, scopeToOrg } from '@/shared/lib/activeOrg'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

function getOrgId() {
  var orgId = getActiveOrgId()
  if (!orgId) throw new Error('No hay org activa')
  return orgId
}

export var INVOICE_STATUS = {
  draft: { label: 'Borrador', color: '#64748b' },
  sent:  { label: 'Enviada',  color: '#3b82f6' },
  paid:  { label: 'Pagada',   color: '#22c55e' },
  void:  { label: 'Anulada',  color: '#ef4444' },
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

export async function getInvoices() {
  let query = supabase
    .from('invoices')
    .select('*, clients(id, name, company)')
    .eq('archived', false)

  query = scopeToOrg(query)

  var res = await query.order('issue_date', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function getInvoiceById(id) {
  let query = supabase
    .from('invoices')
    .select('*, clients(id, name, company, email, phone, instagram)')
    .eq('id', id)

  query = scopeToOrg(query)

  var res = await query.single()
  if (res.error) throw res.error
  return res.data
}

export async function createInvoice(form) {
  var ownerId = await uid()
  var orgId = getOrgId()

  // 1. Traemos la configuracion de empresa para el prefijo y el numero siguiente
  var csRes = await supabase.from('company_settings').select('*').eq('org_id_explicit', orgId).single()
  if (csRes.error) throw csRes.error
  var cs = csRes.data

  var totals = calcTotals(form.items, form.tax_rate)
  var invoiceNumber = (cs.invoice_prefix || 'FAC') + '-' + String(cs.next_invoice_number || 1).padStart(3, '0')

  var res = await supabase.from('invoices').insert({
    owner_id:      ownerId,
    org_id:        orgId,
    client_id:     form.client_id || null,
    invoice_number: invoiceNumber,
    issue_date:    form.issue_date || new Date().toISOString().split('T')[0],
    due_date:      form.due_date   || null,
    items:         form.items || [],
    tax_rate:      Number(form.tax_rate) || 0,
    subtotal:      totals.subtotal,
    tax_amount:    totals.taxAmount,
    total:         totals.total,
    status:        form.status || 'draft',
    notes:         form.notes  || null,
    archived:      false,
  }).select('*, clients(id, name, company)').single()

  if (res.error) throw res.error

  // 2. Avanzamos el numero para la siguiente factura
  await supabase.from('company_settings').update({ next_invoice_number: (cs.next_invoice_number || 1) + 1 }).eq('org_id_explicit', orgId)

  return res.data
}

export async function updateInvoice(id, form) {
  var orgId = getOrgId()
  var totals = calcTotals(form.items, form.tax_rate)
  let query = supabase.from('invoices').update({
    client_id:  form.client_id || null,
    issue_date: form.issue_date || null,
    due_date:   form.due_date   || null,
    items:      form.items || [],
    tax_rate:   Number(form.tax_rate) || 0,
    subtotal:   totals.subtotal,
    tax_amount: totals.taxAmount,
    total:      totals.total,
    status:     form.status || 'draft',
    notes:      form.notes  || null,
  }).eq('id', id)

  query = scopeToOrg(query)

  var res = await query.select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function updateInvoiceStatus(id, status) {
  let query = supabase.from('invoices').update({ status: status }).eq('id', id)

  query = scopeToOrg(query)

  var res = await query.select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveInvoice(id) {
  let query = supabase.from('invoices').update({ archived: true }).eq('id', id)

  query = scopeToOrg(query)

  var res = await query
  if (res.error) throw res.error
  return true
}
