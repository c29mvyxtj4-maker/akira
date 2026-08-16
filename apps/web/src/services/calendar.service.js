import { supabase } from '@/shared/lib/supabase'
import { scopeToOrg, getActiveOrgId } from '@/shared/lib/activeOrg'

export var EVENT_TYPES = {
  meeting:  { label: 'Reunion',    color: '#ef4444', emoji: 'ðŸ“…' },
  shoot:    { label: 'Rodaje',     color: '#ef4444', emoji: 'ðŸŽ¬' },
  delivery: { label: 'Entrega',    color: '#22c55e', emoji: 'ðŸ“¦' },
  call:     { label: 'Llamada',    color: '#3b82f6', emoji: 'ðŸ“ž' },
  deadline: { label: 'Deadline',   color: '#f59e0b', emoji: 'â°' },
  reminder: { label: 'Recordatorio', color: '#ec4899', emoji: 'ðŸ””' },
  personal: { label: 'Personal',   color: '#a855f7', emoji: 'ðŸ‘¤' },
  other:    { label: 'Otro',       color: '#64748b', emoji: 'ðŸ“Œ' },
}

export var EVENT_STATUS = {
  scheduled:  { label: 'Programado', color: 'info' },
  completed:  { label: 'Completado', color: 'success' },
  cancelled:  { label: 'Cancelado',  color: 'default' },
}

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

// Eventos manuales de calendar_events
export async function getCalendarEvents(dateFrom, dateTo) {
  var q = supabase
    .from('calendar_events')
    .select('*, clients(id, name), projects(id, name)')
    .eq('archived', false)
    .order('start_at', { ascending: true })
  q = scopeToOrg(q) // aislar por workspace activo (defensivo)

  if (dateFrom) q = q.gte('start_at', dateFrom)
  if (dateTo)   q = q.lte('start_at', dateTo)

  var res = await q
  if (res.error) throw res.error
  return (res.data || []).map(function(e) {
    return Object.assign({}, e, {
      _source: 'manual',
      _date:   e.start_at ? e.start_at.split('T')[0] : '',
    })
  })
}

export async function createCalendarEvent(form) {
  var ownerId = await uid()

  // Obtener org_id desde el perfil del usuario, fallback a localStorage
  var orgId = getActiveOrgId()
  if (!orgId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.user_metadata && user.user_metadata.org_id) {
        orgId = user.user_metadata.org_id
      }
    } catch (e) {
      console.error('Error fetching org_id from auth:', e)
    }
  }

  var res = await supabase.from('calendar_events').insert({
    title:       form.title,
    description: form.description || null,
    type:        form.type        || 'meeting',
    status:      form.status      || 'scheduled',
    start_at:    form.start_at,
    end_at:      form.end_at      || null,
    all_day:     form.all_day     || false,
    location:    form.location    || null,
    client_id:   form.client_id   || null,
    project_id:  form.project_id  || null,
    owner_id:    ownerId,
    org_id:      orgId || null,
    archived:    false,
  }).select('*, clients(id, name), projects(id, name)').single()
  if (res.error) throw res.error
  return Object.assign({}, res.data, { _source: 'manual', _date: res.data.start_at ? res.data.start_at.split('T')[0] : '' })
}

export async function updateCalendarEvent(id, form) {
  var res = await supabase.from('calendar_events').update({
    title:       form.title,
    description: form.description || null,
    type:        form.type        || 'meeting',
    status:      form.status      || 'scheduled',
    start_at:    form.start_at,
    end_at:      form.end_at      || null,
    all_day:     form.all_day     || false,
    location:    form.location    || null,
    client_id:   form.client_id   || null,
    project_id:  form.project_id  || null,
  }).eq('id', id).select('*, clients(id, name), projects(id, name)').single()
  if (res.error) throw res.error
  return Object.assign({}, res.data, { _source: 'manual', _date: res.data.start_at ? res.data.start_at.split('T')[0] : '' })
}

export async function archiveCalendarEvent(id) {
  var res = await supabase.from('calendar_events').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

// Eventos automaticos derivados de proyectos y suscripciones
export async function getAutoEvents(dateFrom, dateTo) {
  var events = []

  // Deadlines de proyectos activos
  try {
    var rp = await scopeToOrg(supabase
      .from('projects')
      .select('id, name, due_date, status, clients(id, name)'))
      .eq('archived', false)
      .not('due_date', 'is', null)
    if (!rp.error) {
      ;(rp.data || []).forEach(function(p) {
        if (!p.due_date) return
        if (p.status === 'completed' || p.status === 'cancelled') return
        if (dateFrom && p.due_date < dateFrom.split('T')[0]) return
        if (dateTo   && p.due_date > dateTo.split('T')[0])   return
        events.push({
          id:       'auto_proj_' + p.id,
          title:    'Entrega: ' + p.name,
          type:     'deadline',
          status:   'scheduled',
          start_at: p.due_date + 'T00:00:00',
          all_day:  true,
          client_id: p.client_id,
          project_id: p.id,
          clients:  p.clients,
          _source:  'project',
          _date:    p.due_date,
          _readonly: true,
        })
      })
    }
  } catch (e) { console.warn('auto events projects:', e) }

  // Proximos cobros de suscripciones activas
  try {
    var rs = await scopeToOrg(supabase
      .from('subscriptions')
      .select('id, name, next_billing, status, clients(id, name)'))
      .eq('archived', false)
      .eq('status', 'active')
      .not('next_billing', 'is', null)
    if (!rs.error) {
      ;(rs.data || []).forEach(function(s) {
        if (!s.next_billing) return
        if (dateFrom && s.next_billing < dateFrom.split('T')[0]) return
        if (dateTo   && s.next_billing > dateTo.split('T')[0])   return
        events.push({
          id:       'auto_sub_' + s.id,
          title:    'Cobro: ' + s.name,
          type:     'reminder',
          status:   'scheduled',
          start_at: s.next_billing + 'T00:00:00',
          all_day:  true,
          clients:  s.clients,
          _source:  'subscription',
          _date:    s.next_billing,
          _readonly: true,
        })
      })
    }
  } catch (e) { console.warn('auto events subs:', e) }

  return events
}

// Todos los eventos combinados para un rango
export async function getAllEventsForRange(dateFrom, dateTo) {
  var results = await Promise.allSettled([
    getCalendarEvents(dateFrom, dateTo),
    getAutoEvents(dateFrom, dateTo),
  ])
  var manual = results[0].status === 'fulfilled' ? results[0].value : []
  var auto   = results[1].status === 'fulfilled' ? results[1].value : []
  return manual.concat(auto).sort(function(a, b) {
    return (a.start_at || '').localeCompare(b.start_at || '')
  })
}

// Selectores para el formulario
export async function getCalendarSelectors() {
  var results = await Promise.allSettled([
    supabase.from('clients').select('id, name, company').eq('archived', false).order('name'),
    supabase.from('projects').select('id, name').eq('archived', false).order('name'),
  ])
  return {
    clients:  results[0].status === 'fulfilled' ? (results[0].value.data || []) : [],
    projects: results[1].status === 'fulfilled' ? (results[1].value.data || []) : [],
  }
}
