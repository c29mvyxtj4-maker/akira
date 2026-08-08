import { supabase } from '@/lib/supabase'

/*
 * Bandeja de menciones (tabla mentions). Cada usuario ve las suyas. Las
 * menciones se crean desde acciones (asignar tarea, añadir a proyecto…).
 */

async function currentUserId() {
  var res = await supabase.auth.getUser()
  return res.data && res.data.user ? res.data.user.id : null
}

// Mis menciones, con el nombre de quien la provocó (actor) resuelto aparte.
export async function getMyMentions() {
  var uid = await currentUserId()
  if (!uid) return []
  var res = await supabase
    .from('mentions')
    .select('*')
    .eq('target_user', uid)
    .order('created_at', { ascending: false })
    .limit(100)
  if (res.error) throw res.error
  var rows = res.data || []
  var actorIds = rows.map(function (r) { return r.actor_user }).filter(Boolean)
  var byId = {}
  if (actorIds.length) {
    var pr = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', actorIds)
    ;(pr.data || []).forEach(function (p) { byId[p.id] = p })
  }
  return rows.map(function (r) { return Object.assign({}, r, { actor: byId[r.actor_user] || null }) })
}

export async function getUnreadMentionCount() {
  var uid = await currentUserId()
  if (!uid) return 0
  var res = await supabase.from('mentions').select('id', { count: 'exact', head: true })
    .eq('target_user', uid).eq('read', false)
  if (res.error) return 0
  return res.count || 0
}

export async function markMentionRead(id) {
  var res = await supabase.from('mentions').update({ read: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function markAllMentionsRead() {
  var uid = await currentUserId()
  if (!uid) return
  await supabase.from('mentions').update({ read: true }).eq('target_user', uid).eq('read', false)
}

// Crea una mención firmada por el usuario actual. Ignora auto-menciones.
export async function createMention(m) {
  var actor = await currentUserId()
  if (!m || !m.target_user || m.target_user === actor) return null
  var res = await supabase.from('mentions').insert({
    target_user: m.target_user,
    actor_user:  actor,
    org_id:      m.org_id || null,
    type:        m.type,
    source_type: m.source_type || null,
    source_id:   m.source_id || null,
    project_id:  m.project_id || null,
    text:        m.text,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}
