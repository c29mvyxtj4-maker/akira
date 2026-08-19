import { supabase } from '@/lib/supabase'

export var KNOWLEDGE_CATEGORIES = [
  'Procesos', 'Plantillas', 'Clientes', 'Equipamiento',
  'Legal', 'Marketing', 'Finanzas', 'Referencia', 'Otro',
]

export var KNOWLEDGE_STATUS = {
  draft:     { label: 'Borrador',   color: 'default' },
  published: { label: 'Publicado',  color: 'success' },
  archived:  { label: 'Archivado',  color: 'warning' },
}

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getKnowledgeItems(search, category, status) {
  var q = supabase
    .from('knowledge_items')
    .select('*')
    .eq('archived', false)

  if (category && category !== 'all') q = q.eq('category', category)
  if (status   && status   !== 'all') q = q.eq('status',   status)
  if (search && search.trim()) {
    var s = '%' + search.trim() + '%'
    q = q.or('title.ilike.' + s + ',content.ilike.' + s)
  }

  q = q.order('updated_at', { ascending: false })

  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function getKnowledgeItemById(id) {
  var res = await supabase.from('knowledge_items').select('*').eq('id', id).single()
  if (res.error) throw res.error
  return res.data
}

export async function createKnowledgeItem(form) {
  var ownerId = await uid()
  var res = await supabase.from('knowledge_items').insert({
    title:    form.title,
    content:  form.content   || '',
    category: form.category  || 'Otro',
    status:   form.status    || 'draft',
    tags:     form.tags      || [],
    owner_id: ownerId,
    archived: false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateKnowledgeItem(id, form) {
  var res = await supabase.from('knowledge_items').update({
    title:    form.title,
    content:  form.content   || '',
    category: form.category  || 'Otro',
    status:   form.status    || 'draft',
    tags:     form.tags      || [],
  }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveKnowledgeItem(id) {
  var res = await supabase.from('knowledge_items').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}
