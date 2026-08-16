import { supabase } from '@/shared/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

function countWords(content) {
  if (!content) return 0
  var text = ''
  function walk(node) {
    if (!node) return
    if (node.type === 'text' && node.text) text += node.text + ' '
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(content)
  return text.trim().split(/\s+/).filter(function(w) { return w.length > 0 }).length
}

function cleanJSON(node) {
  if (node === null || node === undefined) return node
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') return node
  if (Array.isArray(node)) return node.map(function(item) { return cleanJSON(item) })
  if (typeof node !== 'object') return null
  var allowed = ['type', 'text', 'content', 'marks', 'attrs']
  var clean = {}
  Object.keys(node).forEach(function(key) {
    if (allowed.indexOf(key) === -1) return
    var val = node[key]
    if (val === null || val === undefined) return
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      clean[key] = val
      return
    }
    if (Array.isArray(val)) {
      clean[key] = val.map(function(item) { return cleanJSON(item) })
      return
    }
    if (typeof val === 'object') {
      clean[key] = cleanJSON(val)
      return
    }
  })
  return clean
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   CARPETAS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getFolders() {
  var ownerId = await uid()
  var res = await supabase
    .from('kb_folders')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('archived', false)
    .order('position', { ascending: true })
    .order('name', { ascending: true })
  if (res.error) throw res.error
  return res.data || []
}

export async function createFolder(name, parentId, color, icon) {
  var ownerId = await uid()
  var res = await supabase.from('kb_folders').insert({
    owner_id:  ownerId,
    parent_id: parentId || null,
    name:      name || 'Nueva carpeta',
    color:     color || '#6366f1',
    icon:      icon  || 'ðŸ“',
    position:  0,
    archived:  false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateFolder(id, updates) {
  var res = await supabase.from('kb_folders').update(updates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveFolder(id) {
  var res = await supabase.from('kb_folders').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   DOCUMENTOS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function getDocuments(folderId, search, status) {
  var ownerId = await uid()
  var q = supabase
    .from('kb_documents')
    .select('id,title,icon,status,category,tags,word_count,read_time_min,is_favorited,is_template,folder_id,created_at,updated_at')
    .eq('owner_id', ownerId)
    .eq('archived', false)

  if (folderId === 'favorites')  q = q.eq('is_favorited', true)
  else if (folderId === 'templates') q = q.eq('is_template', true)
  else if (folderId && folderId !== 'all') q = q.eq('folder_id', folderId)

  if (status && status !== 'all') q = q.eq('status', status)
  if (search && search.trim()) q = q.ilike('title', '%' + search.trim() + '%')
  q = q.order('updated_at', { ascending: false })

  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function getDocumentById(id) {
  var res = await supabase.from('kb_documents').select('*').eq('id', id).single()
  if (res.error) throw res.error
  return res.data
}

export async function createDocument(folderId, title) {
  var ownerId = await uid()
  var res = await supabase.from('kb_documents').insert({
    owner_id:  ownerId,
    folder_id: folderId || null,
    title:     title || 'Sin titulo',
    content:   { type: 'doc', content: [] },
    status:    'draft',
    tags:      [],
    archived:  false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateDocument(id, updates) {
  var safeUpdates = {}

  Object.keys(updates).forEach(function(key) {
    var val = updates[key]
    if (val === null || val === undefined) {
      safeUpdates[key] = val
      return
    }
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      safeUpdates[key] = val
      return
    }
    if (Array.isArray(val)) {
      safeUpdates[key] = val.filter(function(v) { return typeof v === 'string' })
      return
    }
    if (key === 'content' && typeof val === 'object') {
      safeUpdates[key] = cleanJSON(val)
      return
    }
  })

  if (safeUpdates.content) {
    var words = countWords(safeUpdates.content)
    safeUpdates.word_count    = words
    safeUpdates.read_time_min = Math.max(1, Math.ceil(words / 200))
  }

  var res = await supabase.from('kb_documents').update(safeUpdates).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveDocument(id) {
  var res = await supabase.from('kb_documents').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function toggleFavorite(id, current) {
  var res = await supabase.from('kb_documents')
    .update({ is_favorited: !current })
    .eq('id', id)
    .select('id,is_favorited')
    .single()
  if (res.error) throw res.error
  return res.data
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   VERSIONES
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function saveVersion(doc) {
  var ownerId = await uid()
  var safeContent = cleanJSON(doc.content) || { type: 'doc', content: [] }
  var res = await supabase.from('kb_document_versions').insert({
    document_id: doc.id,
    owner_id:    ownerId,
    version:     doc.version || 1,
    title:       doc.title || 'Sin titulo',
    content:     safeContent,
    word_count:  doc.word_count || 0,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function getVersions(documentId) {
  var res = await supabase
    .from('kb_document_versions')
    .select('id,version,title,word_count,created_at')
    .eq('document_id', documentId)
    .order('version', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function getVersionContent(versionId) {
  var res = await supabase.from('kb_document_versions').select('*').eq('id', versionId).single()
  if (res.error) throw res.error
  return res.data
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   STORAGE
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */

export async function uploadFile(file, documentId) {
  var ownerId  = await uid()
  var ext      = file.name.split('.').pop()
  var filename = ownerId + '/' + documentId + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext

  var res = await supabase.storage.from('knowledge').upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (res.error) throw res.error

  var urlRes = await supabase.storage.from('knowledge').createSignedUrl(filename, 60 * 60 * 24 * 365)
  if (urlRes.error) throw urlRes.error

  return {
    path: filename,
    url:  urlRes.data.signedUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  }
}

export async function uploadAndSaveAttachment(file, documentId) {
  var uploaded = await uploadFile(file, documentId)
  var ownerId  = await uid()
  var res = await supabase.from('kb_attachments').insert({
    document_id: documentId,
    owner_id:    ownerId,
    name:        uploaded.name,
    file_path:   uploaded.path,
    file_url:    uploaded.url,
    file_type:   uploaded.type,
    file_size:   uploaded.size,
  }).select().single()
  if (res.error) throw res.error
  return Object.assign({}, res.data, { file_url: uploaded.url })
}

export async function getAttachments(documentId) {
  var res = await supabase
    .from('kb_attachments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function deleteAttachment(id, filePath) {
  if (filePath) {
    var del = await supabase.storage.from('knowledge').remove([filePath])
    if (del.error) console.warn('Storage delete error:', del.error)
  }
  var res = await supabase.from('kb_attachments').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function getSignedUrl(filePath) {
  var res = await supabase.storage.from('knowledge').createSignedUrl(filePath, 60 * 60 * 24 * 365)
  if (res.error) throw res.error
  return res.data.signedUrl
}
