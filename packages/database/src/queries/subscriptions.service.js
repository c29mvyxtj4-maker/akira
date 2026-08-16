import { supabase } from '@/lib/supabase'
import { scopeToOrg, getActiveOrgId } from '@/lib/activeOrg'

export var SUB_PERIODS = {
  weekly:    { label: 'Semanal',    months: 1 / 4.33 },
  monthly:   { label: 'Mensual',   months: 1 },
  quarterly: { label: 'Trimestral', months: 3 },
  yearly:    { label: 'Anual',     months: 12 },
}

export var SUB_STATUS = {
  active:    { label: 'Activa',   color: 'success' },
  trial:     { label: 'Trial',    color: 'info' },
  paused:    { label: 'Pausada',  color: 'warning' },
  cancelled: { label: 'Cancelada', color: 'danger' },
}

export function calcMonthlyValue(price, period) {
  var p = Number(price) || 0
  if (period === 'yearly')    return p / 12
  if (period === 'quarterly') return p / 3
  if (period === 'weekly')    return p * 4.33
  return p
}

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getSubscriptions(search, status, clientId) {
  var q = scopeToOrg(supabase
    .from('subscriptions')
    .select('*, clients(id, name, company), services(id, name)')
    .eq('archived', false))
  if (status   && status   !== 'all') q = q.eq('status',    status)
  if (clientId && clientId !== 'all') q = q.eq('client_id', clientId)
  if (search && search.trim()) q = q.ilike('name', '%' + search.trim() + '%')
  q = q.order('created_at', { ascending: false })
  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function createSubscription(form) {
  var ownerId = await uid()
  var res = await supabase.from('subscriptions').insert({
    name:        form.name,
    client_id:   form.client_id   || null,
    service_id:  form.service_id  || null,
    price:       Number(form.price) || 0,
    period:      form.period      || 'monthly',
    status:      form.status      || 'active',
    start_date:  form.start_date  || null,
    next_billing: form.next_billing || null,
    notes:       form.notes       || null,
    owner_id:    ownerId,
    org_id:      getActiveOrgId() || null,
    archived:    false,
  }).select('*, clients(id, name, company), services(id, name)').single()
  if (res.error) throw res.error
  return res.data
}

export async function updateSubscription(id, form) {
  var res = await supabase.from('subscriptions').update({
    name:        form.name,
    client_id:   form.client_id   || null,
    service_id:  form.service_id  || null,
    price:       Number(form.price) || 0,
    period:      form.period      || 'monthly',
    status:      form.status      || 'active',
    start_date:  form.start_date  || null,
    next_billing: form.next_billing || null,
    notes:       form.notes       || null,
  }).eq('id', id).select('*, clients(id, name, company), services(id, name)').single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveSubscription(id) {
  var res = await supabase.from('subscriptions').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function getClientsForSelect() {
  var res = await supabase.from('clients').select('id, name, company').eq('archived', false).order('name')
  if (res.error) throw res.error
  return res.data || []
}

// ← CORREGIDO: quitamos "period" del select, esa columna no existe en la tabla "services"
export async function getServicesForSelect() {
  var res = await supabase.from('services').select('id, name, price, category').eq('archived', false).eq('active', true).order('name')
  if (res.error) throw res.error
  return res.data || []
}