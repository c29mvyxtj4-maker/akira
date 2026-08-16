import { supabase } from '@/shared/lib/supabase'

var DEFAULT_FINANCE_CATEGORIES = [
  'General', 'Produccion', 'Equipamiento', 'Software',
  'Marketing', 'Freelancer', 'Viajes', 'Impuestos', 'Otro',
]

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getFinanceCategories() {
  var ownerId = await uid()
  var res = await supabase
    .from('finance_categories')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('archived', false)
    .order('position', { ascending: true })
    .order('name', { ascending: true })
  if (res.error) throw res.error

  // Primera vez que se usa: no hay categorias todavia, creamos las de siempre para no empezar en blanco
  if (!res.data || res.data.length === 0) {
    var seedRows = DEFAULT_FINANCE_CATEGORIES.map(function(name, i) {
      return { owner_id: ownerId, name: name, position: i, archived: false }
    })
    var seedRes = await supabase.from('finance_categories').insert(seedRows).select()
    if (seedRes.error) throw seedRes.error
    return seedRes.data
  }

  return res.data
}

export async function createFinanceCategory(name) {
  var ownerId = await uid()
  if (!name || !name.trim()) throw new Error('El nombre no puede estar vacio')

  var res = await supabase.from('finance_categories').insert({
    owner_id: ownerId,
    name:     name.trim(),
    position: 999,
    archived: false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function renameFinanceCategory(id, name) {
  if (!name || !name.trim()) throw new Error('El nombre no puede estar vacio')
  var res = await supabase.from('finance_categories').update({ name: name.trim() }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveFinanceCategory(id) {
  var res = await supabase.from('finance_categories').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}
