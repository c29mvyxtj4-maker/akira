import { supabase } from '@/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getProjectFiles(projectId) {
  var res = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .eq('archived', false)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function uploadProjectFile(projectId, file, tag) {
  var ownerId = await uid()

  // Si ya hay archivos con el mismo nombre en este proyecto, este sube de version
  var existing = await supabase
    .from('project_files')
    .select('version')
    .eq('project_id', projectId)
    .eq('name', file.name)
    .eq('archived', false)
    .order('version', { ascending: false })
    .limit(1)

  var nextVersion = 1
  if (!existing.error && existing.data && existing.data.length > 0) {
    nextVersion = (existing.data[0].version || 1) + 1
  }

  var ext = file.name.split('.').pop()
  var path = ownerId + '/' + projectId + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext

  var upRes = await supabase.storage.from('project-files').upload(path, file)
  if (upRes.error) throw upRes.error

  var urlRes = supabase.storage.from('project-files').getPublicUrl(path)

  var res = await supabase.from('project_files').insert({
    owner_id:  ownerId,
    project_id: projectId,
    name:      file.name,
    file_url:  urlRes.data.publicUrl,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
    version:   nextVersion,
    tag:       tag || null,
    archived:  false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deleteProjectFile(id, filePath) {
  await supabase.storage.from('project-files').remove([filePath]).catch(function() {})
  var res = await supabase.from('project_files').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export function fmtFileSize(b) {
  if (!b) return '0 B'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'
  return (b / 1073741824).toFixed(1) + ' GB'
}

export function fileKind(type) {
  if (!type) return 'other'
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type === 'application/pdf') return 'pdf'
  return 'other'
}