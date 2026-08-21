import { supabase } from '@/lib/supabase'
import { getActiveOrgId, scopeToOrg } from '@/shared/lib/activeOrg'

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

function getOrgId() {
  const orgId = getActiveOrgId()
  if (!orgId) throw new Error('No hay org activa')
  return orgId
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   PORTAL USERS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getPortalUsers(clientId) {
  const ownerId = await uid()
  const orgId = getOrgId()
  let q = supabase
    .from('portal_users')
    .select('*, portal_permissions(*)')
    .eq('client_id', clientId)

  q = scopeToOrg(q)

  const res = await q.order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createPortalUser(clientId, email, name) {
  const ownerId = await uid()
  const orgId = getOrgId()
  const res = await supabase.from('portal_users').insert({
    client_id: clientId,
    owner_id:  ownerId,
    org_id:    orgId,
    email:     email.toLowerCase().trim(),
    name:      name || '',
    active:    true,
  }).select().single()
  if (res.error) throw res.error

  // Crear permisos por defecto
  const defaultPerms = ['projects', 'messages', 'files'].map((r) => ({
    portal_user_id: res.data.id,
    resource:       r,
    can_view:       true,
    can_comment:    r === 'messages',
    can_approve:    false,
  }))
  await supabase.from('portal_permissions').insert(defaultPerms)

  return res.data
}

export async function updatePortalUser(id, updates) {
  const res = await supabase.from('portal_users').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deletePortalUser(id) {
  const res = await supabase.from('portal_users').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function updatePortalPermission(portalUserId, resource, updates) {
  const res = await supabase
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
  const res = await supabase.auth.signInWithOtp({
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

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   MENSAJES
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getPortalMessages(clientId) {
  const ownerId = await uid()
  const res = await supabase
    .from('portal_messages')
    .select('*')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
  if (res.error) throw res.error
  return res.data || []
}

export async function sendOwnerMessage(clientId, content) {
  const ownerId = await uid()
  const res = await supabase.from('portal_messages').insert({
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
  const ownerId = await uid()
  const res = await supabase
    .from('portal_messages')
    .update({ read: true })
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .eq('sender_type', 'client')
  if (res.error) throw res.error
  return true
}

export async function getUnreadCount(clientId) {
  const ownerId = await uid()
  const res = await supabase
    .from('portal_messages')
    .select('id', { count: 'exact' })
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .eq('sender_type', 'client')
    .eq('read', false)
  if (res.error) throw res.error
  return res.count || 0
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   ARCHIVOS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getPortalFiles(clientId) {
  const ownerId = await uid()
  const res = await supabase
    .from('portal_files')
    .select('*')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function uploadPortalFile(file, clientId, description) {
  const ownerId  = await uid()
  const ext      = file.name.split('.').pop()
  const filename = 'portal/' + ownerId + '/' + clientId + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext

  const uploadRes = await supabase.storage.from('knowledge').upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadRes.error) throw uploadRes.error

  const urlRes = await supabase.storage.from('knowledge').createSignedUrl(filename, 60 * 60 * 24 * 365)
  if (urlRes.error) throw urlRes.error

  const res = await supabase.from('portal_files').insert({
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
  const res = await supabase.from('portal_files').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   APROBACIONES
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getPortalApprovals(clientId) {
  const ownerId = await uid()
  const res = await supabase
    .from('portal_approvals')
    .select('*, projects(name)')
    .eq('client_id', clientId)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function createPortalApproval(clientId, data) {
  const ownerId = await uid()
  const res = await supabase.from('portal_approvals').insert({
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
  const res = await supabase.from('portal_approvals').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deletePortalApproval(id) {
  const res = await supabase.from('portal_approvals').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   DATOS PARA EL PORTAL (vista del cliente)
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getPortalClientData(clientId, ownerId) {
  const orgId = getOrgId()

  // Get invoices from BOTH tables (legacy + new)
  // This handles the migration period where invoices live in two places
  const getInvoices = async () => {
    try {
      // New invoices from commercial_documents
      const newRes = await supabase
        .from('commercial_documents')
        .select('id,invoice_number,total,status,issue_date,due_date')
        .eq('client_id', clientId)
        .eq('org_id', orgId)
        .eq('document_type', 'invoice')
        .eq('archived', false)
        .in('status', ['sent', 'paid'])
        .order('issue_date', { ascending: false })

      // Legacy invoices from invoices table
      const legacyRes = await supabase
        .from('invoices')
        .select('id,invoice_number,total,status,issue_date,due_date')
        .eq('client_id', clientId)
        .eq('org_id', orgId)
        .eq('archived', false)
        .in('status', ['sent', 'paid'])
        .order('issue_date', { ascending: false })

      const newInvoices = !newRes.error ? (newRes.data || []) : []
      const legacyInvoices = !legacyRes.error ? (legacyRes.data || []) : []

      // Union: combine and deduplicate by ID
      const allInvoices = [...newInvoices, ...legacyInvoices]
      const seen = new Set()
      return allInvoices.filter(inv => {
        if (seen.has(inv.id)) return false
        seen.add(inv.id)
        return true
      })
    } catch (e) {
      console.warn('Error fetching invoices:', e)
      return []
    }
  }

  const results = await Promise.allSettled([
    supabase.from('clients').select('id,name,company,status,niche').eq('id', clientId).eq('org_id', orgId).single(),
    supabase.from('projects').select('id,name,status,stage,progress,due_date,description').eq('client_id', clientId).eq('org_id', orgId).eq('archived', false),
    supabase.from('portal_messages').select('*').eq('client_id', clientId).eq('org_id', orgId).order('created_at', { ascending: true }),
    supabase.from('portal_files').select('*').eq('client_id', clientId).eq('org_id', orgId).order('created_at', { ascending: false }),
    supabase.from('portal_approvals').select('*').eq('client_id', clientId).eq('org_id', orgId).order('created_at', { ascending: false }),
    getInvoices(), // Union query: new + legacy invoices
  ])

  const safe = (r) => (r.status === 'fulfilled' && !r.value.error ? r.value.data : null)

  return {
    client:    safe(results[0]),
    projects:  safe(results[1]) || [],
    messages:  safe(results[2]) || [],
    files:     safe(results[3]) || [],
    approvals: safe(results[4]) || [],
    invoices:  await results[5], // Union already resolved
  }
}

export async function getPortalBranding(ownerId) {
  const res = await supabase.rpc('get_portal_branding', { owner_id_param: ownerId })
  if (res.error || !res.data || res.data.length === 0) {
    return { company_name: null, logo_url: null, brand_color: '#e63946' }
  }
  return res.data[0]
}

