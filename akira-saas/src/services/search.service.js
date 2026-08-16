import { supabase } from '@/shared/lib/supabase'
import { scopeToOrg } from '@/shared/lib/activeOrg'

// Elementos recientes para mostrar al abrir el buscador (sin escribir).
export async function getRecent() {
  var results = await Promise.allSettled([
    supabase.from('kb_documents').select('id, title, updated_at').eq('archived', false).order('updated_at', { ascending: false }).limit(6),
    scopeToOrg(supabase.from('clients').select('id, name, company, updated_at').eq('archived', false)).order('updated_at', { ascending: false }).limit(4),
    scopeToOrg(supabase.from('projects').select('id, name, updated_at').eq('archived', false)).order('updated_at', { ascending: false }).limit(4),
    scopeToOrg(supabase.from('commercial_documents').select('id, invoice_number, created_at').eq('document_type', 'invoice').eq('archived', false)).order('created_at', { ascending: false }).limit(3),
  ])
  function safe(r) { return r.status === 'fulfilled' && !r.value.error ? (r.value.data || []) : [] }
  var out = []
  safe(results[0]).forEach(function(d) { out.push({ type: 'doc', id: d.id, label: d.title || 'Sin título', sublabel: 'Documento', path: '/knowledge', ts: d.updated_at }) })
  safe(results[1]).forEach(function(c) { out.push({ type: 'client', id: c.id, label: c.name, sublabel: c.company || 'Cliente', path: '/clients', ts: c.updated_at }) })
  safe(results[2]).forEach(function(p) { out.push({ type: 'project', id: p.id, label: p.name, sublabel: 'Proyecto', path: '/projects', ts: p.updated_at }) })
  safe(results[3]).forEach(function(i) { out.push({ type: 'invoice', id: i.id, label: i.invoice_number, sublabel: 'Factura', path: '/invoices', ts: i.created_at }) })
  out.sort(function(a, b) { return String(b.ts || '').localeCompare(String(a.ts || '')) })
  return out.slice(0, 12)
}

// Extrae texto plano del contenido TipTap (JSON) de un documento para la preview.
function extractText(node, acc) {
  if (!node || acc.length > 600) return
  if (node.text) acc.push(node.text)
  if (Array.isArray(node.content)) node.content.forEach(function(c) { extractText(c, acc) })
}
export async function getDocPreview(docId) {
  var res = await supabase.from('kb_documents').select('title, content').eq('id', docId).single()
  if (res.error || !res.data) return null
  var acc = []
  try { extractText(res.data.content, acc) } catch (_) { /* noop */ }
  return { title: res.data.title, excerpt: acc.join(' ').slice(0, 500) }
}

export async function searchAll(query) {
  var q = (query || '').trim()
  if (q.length < 2) return []

  var like = '%' + q + '%'

  var results = await Promise.allSettled([
    scopeToOrg(supabase.from('clients').select('id, name, company').eq('archived', false).or('name.ilike.' + like + ',company.ilike.' + like)).limit(5),
    scopeToOrg(supabase.from('projects').select('id, name').eq('archived', false).ilike('name', like)).limit(5),
    scopeToOrg(supabase.from('commercial_documents').select('id, invoice_number, total').eq('document_type', 'invoice').eq('archived', false).ilike('invoice_number', like)).limit(5),
    scopeToOrg(supabase.from('commercial_documents').select('id, quote_number, total').eq('document_type', 'quote').eq('archived', false).ilike('quote_number', like)).limit(5),
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
    out.push({ type: 'quote', id: qt.id, label: qt.quote_number, sublabel: 'Presupuesto', path: '/invoices' })
  })
  safe(results[4]).forEach(function(d) {
    out.push({ type: 'doc', id: d.id, label: d.title || 'Sin titulo', sublabel: 'Documento', path: '/knowledge' })
  })

  return out
}
