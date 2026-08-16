import { supabase } from '@/shared/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   ORGANIZACION
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getMyOrg() {
  var ownerId = await uid()
  var res = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', ownerId)
    .single()
  if (res.error && res.error.code === 'PGRST116') return null
  if (res.error) throw res.error
  return res.data
}

// Todos los espacios de trabajo del usuario (donde es miembro o dueño).
export async function getMyWorkspaces() {
  var ownerId = await uid()
  var mem = await supabase.from('org_members').select('org_id, role').eq('user_id', ownerId)
  var roleByOrg = {}
  var ids = []
  ;(mem.data || []).forEach(function(m) { roleByOrg[m.org_id] = m.role; ids.push(m.org_id) })
  var owned = await supabase.from('organizations').select('id').eq('owner_id', ownerId)
  ;(owned.data || []).forEach(function(o) { if (ids.indexOf(o.id) === -1) ids.push(o.id) })
  if (ids.length === 0) return []
  var res = await supabase.from('organizations').select('*').in('id', ids).order('created_at', { ascending: true })
  if (res.error) throw res.error
  return (res.data || []).map(function(o) {
    return Object.assign({}, o, { _role: roleByOrg[o.id] || (o.owner_id === ownerId ? 'owner' : 'member') })
  })
}

export async function createOrg(name) {
  var ownerId = await uid()
  var slug    = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

  var res = await supabase.from('organizations').insert({
    name:     name,
    slug:     slug,
    owner_id: ownerId,
    plan:     'pro',
  }).select().single()
  if (res.error) throw res.error

  // Añadir al owner como miembro con rol owner. Si esto falla, la org queda
  // sin membresía y las RLS de equipo se rompen –” así que lo surface-amos.
  var mres = await supabase.from('org_members').insert({
    org_id:  res.data.id,
    user_id: ownerId,
    role:    'owner',
    joined_at: new Date().toISOString(),
  })
  if (mres.error) throw mres.error

  return res.data
}

export async function updateOrg(id, updates) {
  var res = await supabase.from('organizations').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   MIEMBROS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getOrgMembers(orgId) {
  var res = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })
  if (res.error) throw res.error
  return res.data || []
}

export async function updateMemberRole(memberId, role) {
  var res = await supabase
    .from('org_members')
    .update({ role: role })
    .eq('id', memberId)
    .select().single()
  if (res.error) throw res.error
  return res.data
}

export async function removeMember(memberId) {
  var res = await supabase.from('org_members').delete().eq('id', memberId)
  if (res.error) throw res.error
  return true
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   INVITACIONES
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getInvitations(orgId) {
  var res = await supabase
    .from('org_invitations')
    .select('*, profiles:invited_by(full_name)')
    .eq('org_id', orgId)
    .eq('accepted', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createInvitation(orgId, email, role) {
  var ownerId = await uid()
  var res = await supabase.from('org_invitations').insert({
    org_id:     orgId,
    email:      email.toLowerCase().trim(),
    role:       role || 'member',
    invited_by: ownerId,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function cancelInvitation(id) {
  var res = await supabase.from('org_invitations').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function sendInvitationEmail(email, orgName, inviteUrl) {
  var res = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: inviteUrl,
      data: {
        invited_to_org: orgName,
        is_team_invite: true,
      },
    },
  })
  if (res.error) throw res.error
  return true
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   AUDIT LOG
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function logAction(orgId, action, resource, resourceId, metadata) {
  var ownerId = await uid()
  await supabase.from('audit_log').insert({
    org_id:      orgId,
    user_id:     ownerId,
    action:      action,
    resource:    resource || null,
    resource_id: resourceId || null,
    metadata:    metadata  || {},
  })
}

export async function getAuditLog(orgId, limit) {
  var res = await supabase
    .from('audit_log')
    .select('*, profiles:user_id(full_name, avatar_url)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit || 50)
  if (res.error) throw res.error
  return res.data || []
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   SETUP INICIAL –” crear org si no existe
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function ensureOrg(userName) {
  var existing = await getMyOrg()
  if (existing) return existing
  return createOrg(userName || 'Mi Empresa')
}
