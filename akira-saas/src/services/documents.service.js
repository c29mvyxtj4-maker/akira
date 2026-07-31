import { supabase } from '@/lib/supabase'
import { getCompanySettings, updateCompanySettings } from '@/services/company.service'
import { scopeToOrg, getActiveOrgId } from '@/lib/activeOrg'

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

export var INVOICE_STATUS = {
  draft: { label: 'Borrador', color: '#64748b' },
  sent:  { label: 'Enviada',  color: '#3b82f6' },
  paid:  { label: 'Pagada',   color: '#22c55e' },
  void:  { label: 'Anulada',  color: '#ef4444' },
}

// ← CAMBIADO: ahora tambien calcula la retencion de IRPF
function calcTotals(items, taxRate, irpfRate) {
  var subtotal = (items || []).reduce(function(s, it) { return s + (Number(it.quantity) || 0) * (Number(it.price) || 0) }, 0)
  var taxAmount  = subtotal * ((Number(taxRate) || 0) / 100)
  var irpfAmount = subtotal * ((Number(irpfRate) || 0) / 100)
  var total = subtotal + taxAmount - irpfAmount
  return {
    subtotal:   Math.round(subtotal * 100) / 100,
    taxAmount:  Math.round(taxAmount * 100) / 100,
    irpfAmount: Math.round(irpfAmount * 100) / 100,
    total:      Math.round(total * 100) / 100,
  }
}

export async function getDocuments(documentType) {
  var q = scopeToOrg(supabase.from('commercial_documents').select('*, clients(id, name, company)').eq('archived', false)).order('issue_date', { ascending: false })
  if (documentType && documentType !== 'all') q = q.eq('document_type', documentType)
  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function getDocumentById(id) {
  var res = await supabase.from('commercial_documents').select('*, clients(id, name, company, email, phone)').eq('id', id).single()
  if (res.error) throw res.error
  return res.data
}

export async function createQuote(form) {
  var ownerId = await uid()
  var cs = await getCompanySettings()
  var totals = calcTotals(form.items, form.tax_rate, form.irpf_rate)
  var quoteNumber = (cs.quote_prefix || 'PRES') + '-' + String(cs.next_quote_number || 1).padStart(3, '0')

  var res = await supabase.from('commercial_documents').insert({
    owner_id: ownerId, client_id: form.client_id || null,
    document_type: 'quote', quote_number: quoteNumber, invoice_number: null,
    org_id: getActiveOrgId() || null,
    issue_date: form.issue_date || new Date().toISOString().split('T')[0],
    valid_until: form.valid_until || null, due_date: null,
    items: form.items || [],
    tax_rate: Number(form.tax_rate) || 0,
    irpf_rate: Number(form.irpf_rate) || 0,
    subtotal: totals.subtotal, tax_amount: totals.taxAmount, irpf_amount: totals.irpfAmount, total: totals.total,
    status: 'draft', notes: form.notes || null, archived: false,
  }).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error

  await updateCompanySettings({ next_quote_number: (cs.next_quote_number || 1) + 1 })
  return res.data
}

export async function createInvoiceDirect(form) {
  var ownerId = await uid()
  var cs = await getCompanySettings()
  var totals = calcTotals(form.items, form.tax_rate, form.irpf_rate)
  var invoiceNumber = (cs.invoice_prefix || 'FAC') + '-' + String(cs.next_invoice_number || 1).padStart(3, '0')

  var res = await supabase.from('commercial_documents').insert({
    owner_id: ownerId, client_id: form.client_id || null,
    document_type: 'invoice', quote_number: null, invoice_number: invoiceNumber,
    org_id: getActiveOrgId() || null,
    issue_date: form.issue_date || new Date().toISOString().split('T')[0],
    valid_until: null, due_date: form.due_date || null,
    items: form.items || [],
    tax_rate: Number(form.tax_rate) || 0,
    irpf_rate: Number(form.irpf_rate) || 0,
    subtotal: totals.subtotal, tax_amount: totals.taxAmount, irpf_amount: totals.irpfAmount, total: totals.total,
    status: 'draft', notes: form.notes || null, archived: false,
  }).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error

  await updateCompanySettings({ next_invoice_number: (cs.next_invoice_number || 1) + 1 })
  return res.data
}

export async function updateDocument(id, form) {
  var totals = calcTotals(form.items, form.tax_rate, form.irpf_rate)
  var payload = {
    client_id: form.client_id || null,
    issue_date: form.issue_date || null,
    items: form.items || [],
    tax_rate: Number(form.tax_rate) || 0,
    irpf_rate: Number(form.irpf_rate) || 0,
    subtotal: totals.subtotal, tax_amount: totals.taxAmount, irpf_amount: totals.irpfAmount, total: totals.total,
    notes: form.notes || null,
  }
  if (form.document_type === 'quote') payload.valid_until = form.valid_until || null
  else payload.due_date = form.due_date || null

  var res = await supabase.from('commercial_documents').update(payload).eq('id', id).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function updateDocumentStatus(id, status) {
  var res = await supabase.from('commercial_documents').update({ status: status }).eq('id', id).select('*, clients(id, name, company)').single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveDocument(id) {
  var res = await supabase.from('commercial_documents').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function convertToInvoice(id) {
  var doc = await getDocumentById(id)
  if (doc.document_type === 'invoice') return doc

  var cs = await getCompanySettings()
  var invoiceNumber = (cs.invoice_prefix || 'FAC') + '-' + String(cs.next_invoice_number || 1).padStart(3, '0')

  var res = await supabase.from('commercial_documents').update({
    document_type: 'invoice',
    invoice_number: invoiceNumber,
    due_date: doc.due_date || null,
    status: 'draft',
  }).eq('id', id).select('*, clients(id, name, company, email, phone)').single()
  if (res.error) throw res.error

  await updateCompanySettings({ next_invoice_number: (cs.next_invoice_number || 1) + 1 })
  return res.data
}

export async function getSelectorsForDocuments() {
  var res = await supabase.from('clients').select('id, name, company').eq('archived', false).order('name')
  if (res.error) throw res.error
  return res.data || []
}