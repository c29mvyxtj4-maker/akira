import { supabase } from '@/lib/supabase'

/*
 * Miembros vinculados a un proyecto (tabla project_members). Los nombres se
 * resuelven contra `profiles` en un segundo paso: project_members.user_id apunta
 * a auth.users, así que PostgREST no puede unir directamente con profiles.
 */

async function attachProfiles(rows) {
  var ids = rows.map(function (r) { return r.user_id }).filter(Boolean)
  if (ids.length === 0) return rows.map(function (r) { return Object.assign({}, r, { profile: null }) })
  var res = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', ids)
  var byId = {}
  ;(res.data || []).forEach(function (p) { byId[p.id] = p })
  return rows.map(function (r) { return Object.assign({}, r, { profile: byId[r.user_id] || null }) })
}

export async function getProjectMembers(projectId) {
  var res = await supabase
    .from('project_members')
    .select('id, user_id, role, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (res.error) throw res.error
  return attachProfiles(res.data || [])
}

export async function addProjectMember(projectId, userId, role) {
  var res = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId, role: role || 'member' })
    .select('id, user_id, role, created_at')
    .single()
  if (res.error) throw res.error
  return res.data
}

export async function removeProjectMember(id) {
  var res = await supabase.from('project_members').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

// Equipo de la organización (con nombres) para elegir a quién añadir al proyecto.
export async function getOrgTeam(orgId) {
  if (!orgId) return []
  var res = await supabase.from('org_members').select('user_id, role').eq('org_id', orgId)
  if (res.error) throw res.error
  return attachProfiles(res.data || [])
}
