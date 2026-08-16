import { supabase } from '@/shared/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

async function fetchAll(table, ownerId) {
  var res = await supabase.from(table).select('*').eq('owner_id', ownerId)
  if (res.error) { console.warn('[export] ' + table + ':', res.error.message); return [] }
  return res.data || []
}

export async function buildExportData() {
  var ownerId = await uid()

  var [clients, projects, invoices, financeEntries, subscriptions, services, calendarEvents, knowledgeDocs] = await Promise.all([
    fetchAll('clients', ownerId),
    fetchAll('projects', ownerId),
    fetchAll('invoices', ownerId),
    fetchAll('finance_entries', ownerId),
    fetchAll('subscriptions', ownerId),
    fetchAll('services', ownerId),
    fetchAll('calendar_events', ownerId),
    fetchAll('kb_documents', ownerId),
  ])

  return {
    exported_at: new Date().toISOString(),
    exported_from: 'AKIRA OS',
    data: {
      clients: clients,
      projects: projects,
      invoices: invoices,
      finance_entries: financeEntries,
      subscriptions: subscriptions,
      services: services,
      calendar_events: calendarEvents,
      knowledge_documents: knowledgeDocs,
    },
  }
}

export async function downloadExport() {
  var payload = await buildExportData()
  var json = JSON.stringify(payload, null, 2)
  var blob = new Blob([json], { type: 'application/json' })
  var url  = URL.createObjectURL(blob)

  var a = document.createElement('a')
  a.href = url
  a.download = 'akira-backup-' + new Date().toISOString().split('T')[0] + '.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return payload
}

/* –”€–”€ Exportar una sola tabla como CSV (mas facil de abrir en Excel) –”€–”€ */
function toCsvValue(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') v = JSON.stringify(v)
  var s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function downloadCsv(table, filename) {
  var ownerId = await uid()
  var rows = await fetchAll(table, ownerId)
  if (rows.length === 0) throw new Error('No hay datos que exportar en esta tabla')

  var headers = Object.keys(rows[0])
  var lines = [headers.join(',')]
  rows.forEach(function(row) {
    lines.push(headers.map(function(h) { return toCsvValue(row[h]) }).join(','))
  })

  var csv  = lines.join('\n')
  var blob = new Blob([csv], { type: 'text/csv' })
  var url  = URL.createObjectURL(blob)

  var a = document.createElement('a')
  a.href = url
  a.download = filename + '-' + new Date().toISOString().split('T')[0] + '.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
