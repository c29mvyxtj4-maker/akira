import { supabase } from '@/lib/supabase'

export var SERVICE_CATEGORIES = [
  'Video', 'Foto', 'Motion Graphics', 'Podcast',
  'Streaming', 'Edicion', 'Consultoria', 'Pack', 'Otro',
]

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getServices(search, category, onlyActive) {
  var q = supabase.from('services').select('*').eq('archived', false)
  if (category && category !== 'all') q = q.eq('category', category)
  if (onlyActive) q = q.eq('active', true)
  if (search && search.trim()) q = q.ilike('name', '%' + search.trim() + '%')
  q = q.order('category').order('name')
  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function createService(form) {
  var ownerId = await uid()
  var res = await supabase.from('services').insert({
    name:        form.name,
    description: form.description || null,
    category:    form.category    || 'Otro',
    price:       Number(form.price)  || 0,
    cost:        Number(form.cost)   || 0,
    unit:        form.unit        || 'proyecto',
    active:      form.active !== false,
    owner_id:    ownerId,
    archived:    false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateService(id, form) {
  var res = await supabase.from('services').update({
    name:        form.name,
    description: form.description || null,
    category:    form.category    || 'Otro',
    price:       Number(form.price)  || 0,
    cost:        Number(form.cost)   || 0,
    unit:        form.unit        || 'proyecto',
    active:      form.active !== false,
  }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveService(id) {
  var res = await supabase.from('services').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}