import { supabase } from '@/lib/supabase'

export async function searchAll(query) {
  var q = (query || '').trim()
  if (q.length < 2) return []

  var like = '%' + q + '%'

  var results = await Promise.allSettled([
    supabase.from('clients').select('id, name, company').eq('archived', false).or('name.ilike.' + like + ',company.ilike.' + like).limit(5),
    supabase.from('projects').select('id, name').eq('archived', false).ilike('name', like).limit(5),
    supabase.from('invoices').select('id, invoice_number, total').eq('archived', false).ilike('invoice_number', like).limit(5),
    supabase.from('quotes').select('id, quote_number, total').eq('archived', false).ilike('quote_number', like).limit(5),
    supabase.from('kb_documents').select('id, title').eq('archived', false).ilike('title', like).limit(5),
  ])

  function safe(r) { return r.status === 'fulfilled' && !r.value.error ? (r.value.data || []) : [] }

  var out = []

  safe(results[0]).forEach(function(c) {
    out.push({ type: 'client', id: c.id, label: c.name, sublabel: c.company || 'Cliente', path: '/clients' })
  })
  safe(results[1]).forEach(function(p) {
    out.push({ type: 'project', id: p.id, label: p.name, sublabel: 'Proyecto', path: '/projects' })
  })
  safe(results[2]).forEach(function(i) {
    out.push({ type: 'invoice', id: i.id, label: i.invoice_number, sublabel: 'Factura', path: '/invoices' })
  })
  safe(results[3]).forEach(function(qt) {
    out.push({ type: 'quote', id: qt.id, label: qt.quote_number, sublabel: 'Presupuesto', path: '/quotes' })
  })
  safe(results[4]).forEach(function(d) {
    out.push({ type: 'doc', id: d.id, label: d.title || 'Sin titulo', sublabel: 'Documento', path: '/knowledge' })
  })

  return out
}