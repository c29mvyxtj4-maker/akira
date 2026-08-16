import { supabase } from '@/lib/supabase'
import { getActiveOrgId, scopeToOrg } from '@/lib/activeOrg'

/* ── Constantes exportadas ──────────────────────────────── */
export const CLIENT_NICHES = [
  'Club / Equipo deportivo', 'Marca / Empresa', 'Artista / Músico',
  'Podcast / Media', 'Negocio local', 'Evento / Festival',
  'Institución pública', 'Agencia', 'Influencer / Creator', 'Otro',
]

export const CLIENT_SOURCES_MAP = {
  referral:      'Referido',
  instagram:     'Instagram',
  web:           'Web',
  networking:    'Networking',
  cold_outreach: 'Outreach frío',
  event:         'Evento',
  other:         'Otro',
  unknown:       'Desconocido',
}

export const TIMELINE_TYPES = {
  note:     { label: 'Nota',        color: '#6366f1', emoji: '📝' },
  meeting:  { label: 'Reunión',     color: '#22c55e', emoji: '📅' },
  call:     { label: 'Llamada',     color: '#3b82f6', emoji: '📞' },
  delivery: { label: 'Entrega',     color: '#a855f7', emoji: '📦' },
  proposal: { label: 'Propuesta',   color: '#f59e0b', emoji: '📄' },
  incident: { label: 'Incidencia',  color: '#ef4444', emoji: '⚠️' },
  other:    { label: 'Otro',        color: '#64748b', emoji: '💬' },
}

/* ── Helper uid ─────────────────────────────────────────── */
async function uid() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

function getOrgId() {
  const orgId = getActiveOrgId()
  if (!orgId) throw new Error('No hay org activa')
  return orgId
}

/* ═══════════════════════════════════════════════════════════
   CLIENTS — CRUD
═══════════════════════════════════════════════════════════ */

export async function getClients({
  search    = '',
  status    = 'all',
  niche     = 'all',
  sortBy    = 'updated_at',
  sortDir   = 'desc',
} = {}) {
  let q = supabase
    .from('clients')
    .select('*')
    .eq('archived', false)

  if (status !== 'all') q = q.eq('status', status)
  if (niche  !== 'all') q = q.eq('niche',  niche)

  if (search.trim()) {
    const s = `%${search.trim()}%`
    q = q.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s}`)
  }

  q = scopeToOrg(q)
  q = q.order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false })

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getClientById(id) {
  let q = supabase
    .from('clients')
    .select('*')
    .eq('id', id)

  q = scopeToOrg(q)

  const { data, error } = await q.single()
  if (error) throw error
  return data
}

export async function createClient(payload) {
  const ownerId = await uid()
  const orgId = getOrgId()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...sanitize(payload), owner_id: ownerId, org_id: orgId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id, payload) {
  let q = supabase
    .from('clients')
    .update(sanitize(payload))
    .eq('id', id)

  q = scopeToOrg(q)

  const { data, error } = await q.select().single()
  if (error) throw error
  return data
}

export async function archiveClient(id) {
  let q = supabase
    .from('clients')
    .update({ archived: true })
    .eq('id', id)

  q = scopeToOrg(q)

  const { error } = await q
  if (error) throw error
  return true
}

function sanitize(p) {
  return {
    name:             p.name,
    company:          p.company         || null,
    email:            p.email           || null,
    phone:            p.phone           || null,
    website:          p.website         || null,
    instagram:        p.instagram       || null,
    niche:            p.niche           || null,
    status:           p.status          || 'lead',
    source:           p.source          || 'unknown',
    monthly_value:    Number(p.monthly_value) || 0,
    notes:            p.notes           || null,
    next_followup_at: p.next_followup_at || null,
  }
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════════════════════ */

export async function getTimeline(clientId) {
  const { data, error } = await supabase
    .from('client_timeline')
    .select('*')
    .eq('client_id', clientId)
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addTimelineEntry(clientId, { type, content, occurred_at }) {
  const ownerId = await uid()
  const { data, error } = await supabase
    .from('client_timeline')
    .insert({
      client_id:  clientId,
      owner_id:   ownerId,
      type:       type || 'note',
      content,
      occurred_at: occurred_at || new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  // actualizar last_contact_at
  await supabase
    .from('clients')
    .update({ last_contact_at: occurred_at || new Date().toISOString() })
    .eq('id', clientId)

  return data
}

export async function deleteTimelineEntry(id) {
  const { error } = await supabase.from('client_timeline').delete().eq('id', id)
  if (error) throw error
  return true
}

/* ═══════════════════════════════════════════════════════════
   DATOS RELACIONADOS
═══════════════════════════════════════════════════════════ */

export async function getClientProjects(clientId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, stage, due_date, budget, actual_cost, progress, tasks')
    .eq('client_id', clientId)
    .eq('archived', false)
    .order('due_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return (data || []).map(p => ({
    ...p,
    tasks: Array.isArray(p.tasks) ? p.tasks : [],
  }))
}

export async function getClientFinance(clientId) {
  const { data, error } = await supabase
    .from('finance_entries')
    .select('type, amount, status, entry_date, description')
    .eq('client_id', clientId)
    .eq('archived', false)
    .order('entry_date', { ascending: false })
  if (error) throw error
  const rows = data || []
  const income  = rows.filter(r => ['income','payment'].includes(r.type)).reduce((s,r) => s + Number(r.amount), 0)
  const expense = rows.filter(r => r.type === 'expense').reduce((s,r) => s + Number(r.amount), 0)
  const pending = rows.filter(r => r.type === 'invoice' && r.status === 'pending').reduce((s,r) => s + Number(r.amount), 0)
  return { income, expense, profit: income - expense, pending, entries: rows }
}