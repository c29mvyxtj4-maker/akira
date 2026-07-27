import { supabase } from '@/lib/supabase'

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

export async function getCompanySettings() {
  var ownerId = await uid()
  var res = await supabase.from('company_settings').select('*').eq('owner_id', ownerId).maybeSingle()
  if (res.error) throw res.error
  if (res.data) return res.data

  // No existe todavia: creamos la fila por defecto la primera vez
  var insertRes = await supabase.from('company_settings').insert({ owner_id: ownerId }).select().single()
  if (insertRes.error) throw insertRes.error
  return insertRes.data
}

export async function updateCompanySettings(updates) {
  var ownerId = await uid()
  var res = await supabase.from('company_settings').update(updates).eq('owner_id', ownerId).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function uploadLogo(file) {
  var ownerId = await uid()
  var ext  = file.name.split('.').pop()
  var path = ownerId + '/logo.' + ext
  var upRes = await supabase.storage.from('invoices').upload(path, file, { upsert: true })
  if (upRes.error) throw upRes.error
  var urlRes = supabase.storage.from('invoices').getPublicUrl(path)
  return urlRes.data.publicUrl
}