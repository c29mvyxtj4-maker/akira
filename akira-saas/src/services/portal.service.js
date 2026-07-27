import { supabase } from '@/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

/* ═══════════════════════════════════════════════════════════
   PORTAL USERS
═══════════════════════════════════════════════════════════ */

export async function getPortalUsers(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_users')
    .select('*, portal_permissions(*)')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createPortalUser(clientId, email, name) {
  var ownerId = await uid()
  var res = await supabase.from('portal_users').insert({
    client_id: clientId,
    owner_id:  ownerId,
    email:     email.toLowerCase().trim(),
    name:      name || '',
    active:    true,
  }).select().single()
  if (res.error) throw res.error

  // Crear permisos por defecto
  var defaultPerms = ['projects', 'messages', 'files'].map(function(r) {
    return {
      portal_user_id: res.data.id,
      resource:       r,
      can_view:       true,
      can_comment:    r === 'messages',
      can_approve:    false,
    }
  })
  await supabase.from('portal_permissions').insert(defaultPerms)

  return res.data
}

export async function updatePortalUser(id, updates) {
  var res = await supabase.from('portal_users').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deletePortalUser(id) {
  var res = await supabase.from('portal_users').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function updatePortalPermission(portalUserId, resource, updates) {
  var res = await supabase
    .from('portal_permissions')
    .update(updates)
    .eq('portal_user_id', portalUserId)
    .eq('resource', resource)
    .select()
    .single()
  if (res.error) throw res.error
  return res.data
}

export async function sendPortalInvite(email, clientName, portalUrl) {
  var res = await supabase.auth.signInWithOtp({
    email:   email.toLowerCase().trim(),
    options: {
      emailRedirectTo: portalUrl + '/dashboard',
      shouldCreateUser: true,
      data: {
        portal_client:  clientName,
        is_portal_user: true,
      },
    },
  })

  if (res.error) throw res.error

  return true
}

/* ═══════════════════════════════════════════════════════════
   MENSAJES
═══════════════════════════════════════════════════════════ */

export async function getPortalMessages(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_messages')
    .select('*')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
  if (res.error) throw res.error
  return res.data || []
}

export async function sendOwnerMessage(clientId, content) {
  var ownerId = await uid()
  var res = await supabase.from('portal_messages').insert({
    client_id:   clientId,
    owner_id:    ownerId,
    sender_type: 'owner',
    content:     content,
    read:        false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function markMessagesAsRead(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_messages')
    .update({ read: true })
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .eq('sender_type', 'client')
  if (res.error) throw res.error
  return true
}

export async function getUnreadCount(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_messages')
    .select('id', { count: 'exact' })
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .eq('sender_type', 'client')
    .eq('read', false)
  if (res.error) throw res.error
  return res.count || 0
}

/* ═══════════════════════════════════════════════════════════
   ARCHIVOS
═══════════════════════════════════════════════════════════ */

export async function getPortalFiles(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_files')
    .select('*')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function uploadPortalFile(file, clientId, description) {
  var ownerId = await uid()
  var ext      = file.name.split('.').pop()
  var filename = 'portal/' + ownerId + '/' + clientId + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext

  var uploadRes = await supabase.storage.from('knowledge').upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadRes.error) throw uploadRes.error

  var urlRes = await supabase.storage.from('knowledge').createSignedUrl(filename, 60 * 60 * 24 * 365)
  if (urlRes.error) throw urlRes.error

  var res = await supabase.from('portal_files').insert({
    client_id:   clientId,
    owner_id:    ownerId,
    name:        file.name,
    file_path:   filename,
    file_url:    urlRes.data.signedUrl,
    file_type:   file.type,
    file_size:   file.size,
    description: description || '',
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deletePortalFile(id, filePath) {
  if (filePath) {
    await supabase.storage.from('knowledge').remove([filePath])
  }
  var res = await supabase.from('portal_files').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

/* ═══════════════════════════════════════════════════════════
   APROBACIONES
═══════════════════════════════════════════════════════════ */

export async function getPortalApprovals(clientId) {
  var ownerId = await uid()
  var res = await supabase
    .from('portal_approvals')
    .select('*, projects(name)')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createPortalApproval(clientId, data) {
  var ownerId = await uid()
  var res = await supabase.from('portal_approvals').insert({
    client_id:   clientId,
    owner_id:    ownerId,
    project_id:  data.project_id || null,
    title:       data.title,
    description: data.description || '',
    status:      'pending',
    due_date:    data.due_date || null,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updatePortalApproval(id, updates) {
  var res = await supabase.from('portal_approvals').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deletePortalApproval(id) {
  var res = await supabase.from('portal_approvals').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

/* ═══════════════════════════════════════════════════════════
   DATOS PARA EL PORTAL (vista del cliente)
═══════════════════════════════════════════════════════════ */

export async function getPortalClientData(clientId, ownerId) {
  var results = await Promise.allSettled([
    supabase.from('clients').select('id,name,company,status,niche').eq('id', clientId).eq('owner_id', ownerId).single(),
    supabase.from('projects').select('id,name,status,stage,progress,due_date,description').eq('client_id', clientId).eq('owner_id', ownerId).eq('archived', false),
    supabase.from('portal_messages').select('*').eq('client_id', clientId).eq('owner_id', ownerId).order('created_at', { ascending: true }),
    supabase.from('portal_files').select('*').eq('client_id', clientId).eq('owner_id', ownerId).order('created_at', { ascending: false }),
    supabase.from('portal_approvals').select('*').eq('client_id', clientId).eq('owner_id', ownerId).order('created_at', { ascending: false }),
    // Facturas visibles para el cliente (solo enviadas/pagadas), vía política RLS de portal
    supabase.from('invoices').select('id,invoice_number,total,status,issue_date,due_date').eq('client_id', clientId).in('status', ['sent', 'paid']).order('issue_date', { ascending: false }),
  ])

  function safe(r) { return r.status === 'fulfilled' && !r.value.error ? r.value.data : null }

return {
    client:    safe(results[0]),
    projects:  safe(results[1]) || [],
    messages:  safe(results[2]) || [],
    files:     safe(results[3]) || [],
    approvals: safe(results[4]) || [],
    invoices:  safe(results[5]) || [],
  }
}

export async function getPortalBranding(ownerId) {
  var res = await supabase.rpc('get_portal_branding', { owner_id_param: ownerId })
  if (res.error || !res.data || res.data.length === 0) {
    return { company_name: null, logo_url: null, brand_color: '#e63946' }
  }
  return res.data[0]
}