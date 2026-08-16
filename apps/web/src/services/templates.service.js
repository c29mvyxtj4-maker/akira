import { supabase } from '@/shared/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PLANTILLAS DE PROYECTO
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export async function getProjectTemplates() {
  var ownerId = await uid()
  var res = await supabase.from('project_templates').select('*').eq('owner_id', ownerId).eq('archived', false).order('name')
  if (res.error) throw res.error
  return res.data || []
}

export async function createProjectTemplate(data) {
  var ownerId = await uid()
  if (!data.name || !data.name.trim()) throw new Error('El nombre es obligatorio')
  var res = await supabase.from('project_templates').insert({
    owner_id:         ownerId,
    name:             data.name.trim(),
    default_priority: data.default_priority || 'medium',
    default_stage:    data.default_stage    || 'preproduction',
    default_budget:   Number(data.default_budget) || 0,
    default_notes:    data.default_notes || null,
    archived:         false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateProjectTemplate(id, data) {
  var res = await supabase.from('project_templates').update({
    name:             data.name,
    default_priority: data.default_priority,
    default_stage:    data.default_stage,
    default_budget:   Number(data.default_budget) || 0,
    default_notes:    data.default_notes || null,
  }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveProjectTemplate(id) {
  var res = await supabase.from('project_templates').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PLANTILLAS DE EMAIL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export async function getEmailTemplates() {
  var ownerId = await uid()
  var res = await supabase.from('email_templates').select('*').eq('owner_id', ownerId).eq('archived', false).order('name')
  if (res.error) throw res.error
  return res.data || []
}

export async function createEmailTemplate(data) {
  var ownerId = await uid()
  if (!data.name || !data.name.trim()) throw new Error('El nombre es obligatorio')
  if (!data.subject || !data.subject.trim()) throw new Error('El asunto es obligatorio')
  if (!data.body || !data.body.trim()) throw new Error('El cuerpo del email es obligatorio')
  var res = await supabase.from('email_templates').insert({
    owner_id: ownerId,
    name:     data.name.trim(),
    subject:  data.subject.trim(),
    body:     data.body.trim(),
    archived: false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function updateEmailTemplate(id, data) {
  var res = await supabase.from('email_templates').update({
    name:    data.name,
    subject: data.subject,
    body:    data.body,
  }).eq('id', id).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveEmailTemplate(id) {
  var res = await supabase.from('email_templates').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

/* â”€â”€ Rellena {{nombre}} / {{empresa}} con los datos reales del cliente y arma el mailto â”€â”€ */
export function buildTemplateMailto(template, client) {
  if (!client || !client.email) return null

  function fill(text) {
    return text
      .replace(/\{\{\s*nombre\s*\}\}/gi, client.name || '')
      .replace(/\{\{\s*empresa\s*\}\}/gi, client.company || '')
  }

  var subject = fill(template.subject)
  var body    = fill(template.body)

  return 'mailto:' + encodeURIComponent(client.email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
}
