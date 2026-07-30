import { supabase } from '@/lib/supabase'

/* Chat de equipo (team_messages) + anuncios (announcements), con realtime. */

async function uid() {
  var r = await supabase.auth.getUser()
  return r.data && r.data.user ? r.data.user.id : null
}

// ── Chat de equipo ────────────────────────────────────────────────────
export async function getTeamMessages(orgId) {
  if (!orgId) return []
  var res = await supabase.from('team_messages').select('*')
    .eq('org_id', orgId).order('created_at', { ascending: true }).limit(200)
  if (res.error) throw res.error
  return res.data || []
}

export async function sendTeamMessage(orgId, text) {
  var me = await uid()
  var res = await supabase.from('team_messages')
    .insert({ org_id: orgId, user_id: me, text: text }).select().single()
  if (res.error) throw res.error
  return res.data
}

export function subscribeTeamMessages(orgId, onInsert) {
  var ch = supabase.channel('team_messages:' + orgId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_messages', filter: 'org_id=eq.' + orgId },
      function (payload) { onInsert(payload.new) })
    .subscribe()
  return function () { supabase.removeChannel(ch) }
}

// ── Anuncios (solo owner publica) ─────────────────────────────────────
export async function getAnnouncements(orgId) {
  if (!orgId) return []
  var res = await supabase.from('announcements').select('*')
    .eq('org_id', orgId).order('created_at', { ascending: false }).limit(100)
  if (res.error) throw res.error
  return res.data || []
}

export async function postAnnouncement(orgId, title, body) {
  var me = await uid()
  var res = await supabase.from('announcements')
    .insert({ org_id: orgId, author_id: me, title: title || null, body: body }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function deleteAnnouncement(id) {
  var res = await supabase.from('announcements').delete().eq('id', id)
  if (res.error) throw res.error
  return true
}

export function subscribeAnnouncements(orgId, onInsert) {
  var ch = supabase.channel('announcements:' + orgId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements', filter: 'org_id=eq.' + orgId },
      function (payload) { onInsert(payload.new) })
    .subscribe()
  return function () { supabase.removeChannel(ch) }
}
