import { supabase } from '@/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getProjectTimeEntries(projectId) {
  var res = await supabase
    .from('time_entries')
    .select('*')
    .eq('project_id', projectId)
    .order('started_at', { ascending: false })
  if (res.error) throw res.error
  return res.data || []
}

export async function getRunningEntry() {
  var ownerId = await uid()
  var res = await supabase
    .from('time_entries')
    .select('*, projects(id, name)')
    .eq('owner_id', ownerId)
    .eq('is_running', true)
    .maybeSingle()
  if (res.error) throw res.error
  return res.data
}

export async function startTimer(projectId, description) {
  var ownerId = await uid()

  var running = await getRunningEntry()
  if (running) await stopTimer(running.id)

  var res = await supabase.from('time_entries').insert({
    owner_id:    ownerId,
    project_id:  projectId,
    description: description || null,
    started_at:  new Date().toISOString(),
    is_running:  true,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function stopTimer(entryId) {
  var current = await supabase.from('time_entries').select('*').eq('id', entryId).single()
  if (current.error) throw current.error

  var startedAt = new Date(current.data.started_at)
  var endedAt   = new Date()
  var seconds   = Math.max(1, Math.round((endedAt - startedAt) / 1000)) // ← NUEVO: precision real en segundos

  var res = await supabase.from('time_entries').update({
    ended_at:         endedAt.toISOString(),
    duration_seconds: seconds,                         // ← NUEVO
    duration_minutes: Math.round(seconds / 60),          // se mantiene solo para ordenar/sumar rapido
    is_running:       false,
  }).eq('id', entryId).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function addManualEntry(projectId, form) {
  var ownerId = await uid()
  var hours = Number(form.hours) || 0
  if (hours <= 0) throw new Error('Las horas deben ser mayores que 0')

  var date = form.date || new Date().toISOString().split('T')[0]
  var started = new Date(date + 'T09:00:00')
  var seconds = Math.round(hours * 3600)
  var ended   = new Date(started.getTime() + seconds * 1000)

  var res = await supabase.from('time_entries').insert({
    owner_id:         ownerId,
    project_id:       projectId,
    description:      form.description || null,
    started_at:       started.toISOString(),
    ended_at:         ended.toISOString(),
    duration_seconds: seconds,        // ← NUEVO
    duration_minutes: Math.round(seconds / 60),
    is_running:       false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deleteTimeEntry(id) {
  var res = await supabase.from('time_entries').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

// ← CORREGIDO: recibe segundos, no minutos, y muestra con precision real
export function fmtDuration(totalSeconds) {
  var s = Number(totalSeconds) || 0
  if (s < 60) return s + 's'

  var h = Math.floor(s / 3600)
  var m = Math.floor((s % 3600) / 60)

  if (h > 0) return h + 'h ' + m + 'm'
  return m + 'm'
}

// Para sumar el total del proyecto (usa segundos si estan disponibles, si no, cae a minutos por compatibilidad)
export function sumSeconds(entries) {
  return entries.reduce(function(sum, e) {
    if (e.duration_seconds != null) return sum + e.duration_seconds
    return sum + (e.duration_minutes || 0) * 60
  }, 0)
}