import { supabase } from '@/shared/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

/* â”€â”€ Perfil â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function getProfile() {
  var ownerId = await uid()
  var res = await supabase.from('profiles').select('*').eq('id', ownerId).single()
  if (res.error) throw res.error
  return res.data
}

export async function updateProfile(updates) {
  var ownerId = await uid()
  var safe = {}
  var allowed = ['full_name', 'avatar_url', 'phone', 'website', 'bio', 'location', 'company', 'role']
  allowed.forEach(function(k) { if (updates[k] !== undefined) safe[k] = updates[k] })
  var res = await supabase.from('profiles').update(safe).eq('id', ownerId).select().single()
  if (res.error) throw res.error
  return res.data
}

/* â”€â”€ Workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function getWorkspace() {
  var ownerId = await uid()
  var res = await supabase.from('workspace_settings').select('*').eq('owner_id', ownerId).single()
  if (res.error && res.error.code === 'PGRST116') {
    // No existe â€” crear uno por defecto
    var created = await supabase.from('workspace_settings').insert({
      owner_id:     ownerId,
      business_name: '',
      currency:     'EUR',
      timezone:     'Europe/Madrid',
      language:     'es',
    }).select().single()
    if (created.error) throw created.error
    return created.data
  }
  if (res.error) throw res.error
  return res.data
}

export async function updateWorkspace(updates) {
  var ownerId = await uid()
  var res = await supabase.from('workspace_settings').update(updates).eq('owner_id', ownerId).select().single()
  if (res.error) throw res.error
  return res.data
}

/* â”€â”€ Password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function updatePassword(newPassword) {
  var res = await supabase.auth.updateUser({ password: newPassword })
  if (res.error) throw res.error
  return true
}

/* â”€â”€ Estadisticas de la cuenta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function getAccountStats() {
  var ownerId = await uid()
  var results = await Promise.allSettled([
    supabase.from('clients').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('archived', false),
    supabase.from('projects').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('archived', false),
    supabase.from('finance_entries').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('archived', false),
    supabase.from('kb_documents').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('archived', false),
    supabase.from('brain_conversations').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('archived', false),
  ])

  function count(r) {
    return r.status === 'fulfilled' && !r.value.error ? (r.value.count || 0) : 0
  }

  return {
    clients:       count(results[0]),
    projects:      count(results[1]),
    finance:       count(results[2]),
    documents:     count(results[3]),
    conversations: count(results[4]),
  }
}

/* â”€â”€ Verificar columnas del perfil â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function ensureProfileColumns() {
  // No hace nada en el cliente â€” solo comprueba que el perfil existe
  return true
}
