import { supabase } from '@/lib/supabase'

export var RESOURCE_LABELS = {
  clients:         'Cliente',
  projects:        'Proyecto',
  invoices:        'Factura',
  finance_entries: 'Movimiento',
  calendar_events: 'Evento',
}

export var ACTION_LABELS = {
  created: { label: 'Creado',    color: '#22c55e' },
  updated: { label: 'Editado',   color: '#3b82f6' },
  deleted: { label: 'Eliminado', color: '#ef4444' },
}

function extractName(resource, action, metadata) {
  if (!metadata) return null
  var source = action === 'updated' ? metadata.after : metadata
  if (!source) return null

  if (resource === 'clients')  return source.name || null
  if (resource === 'projects') return source.name || null
  if (resource === 'invoices') return source.invoice_number || null
  if (resource === 'finance_entries') return source.description || null
  if (resource === 'calendar_events') return source.title || null
  return null
}

function extractChanges(metadata) {
  if (!metadata || !metadata.before || !metadata.after) return []
  var before = metadata.before
  var after  = metadata.after
  var ignore = ['id', 'updated_at', 'created_at', 'owner_id', 'archived']
  var changes = []

  Object.keys(after).forEach(function(key) {
    if (ignore.includes(key)) return
    var oldVal = before[key]
    var newVal = after[key]
    var oldStr = JSON.stringify(oldVal)
    var newStr = JSON.stringify(newVal)
    if (oldStr !== newStr) {
      changes.push({ field: key, from: oldVal, to: newVal })
    }
  })

  return changes
}

export async function getAuditLog(filters) {
  var resource = (filters && filters.resource) || 'all'
  var action   = (filters && filters.action)   || 'all'
  var limit    = (filters && filters.limit)    || 100

  var q = supabase
    .from('audit_log')
    .select('*') // –† CORREGIDO: ya no intentamos unir con "profiles" aqui
    .order('created_at', { ascending: false })
    .limit(limit)

  if (resource !== 'all') q = q.eq('resource', resource)
  if (action   !== 'all') q = q.eq('action', action)

  var res = await q
  if (res.error) throw res.error
  var rows = res.data || []

  // –† NUEVO: traemos los nombres de los usuarios implicados en un segundo paso, y los juntamos aqui
  var userIds = Array.from(new Set(rows.map(function(r) { return r.user_id }).filter(Boolean)))
  var namesById = {}
  if (userIds.length > 0) {
    var profRes = await supabase.from('profiles').select('id, full_name').in('id', userIds)
    if (!profRes.error) {
      (profRes.data || []).forEach(function(p) { namesById[p.id] = p.full_name })
    }
  }

  return rows.map(function(row) {
    return Object.assign({}, row, {
      userName:    namesById[row.user_id] || null,
      displayName: extractName(row.resource, row.action, row.metadata),
      changes:     row.action === 'updated' ? extractChanges(row.metadata) : [],
    })
  })
}

export async function fetchAuditLogs(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('org_id', user.user_metadata?.org_id)
    .order('created_at', { ascending: false })
    .limit(500)

  if (filters.action) {
    query = query.eq('action', filters.action)
  }
  if (filters.table) {
    query = query.eq('table_name', filters.table)
  }
  if (filters.user) {
    query = query.eq('user_id', filters.user)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  return query
}

export async function exportAuditLogsCSV(logs) {
  if (!logs || logs.length === 0) {
    alert('No hay eventos para exportar')
    return
  }

  const headers = ['Fecha', 'Acción', 'Tabla', 'Usuario', 'Record ID', 'Valores anteriores', 'Nuevos valores']
  const rows = logs.map(log => [
    new Date(log.created_at).toLocaleString('es-ES'),
    log.action,
    log.table_name,
    log.user_email || 'Sistema',
    log.record_id,
    JSON.stringify(log.old_values || {}),
    JSON.stringify(log.new_values || {}),
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `audit-log-${new Date().toISOString()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
