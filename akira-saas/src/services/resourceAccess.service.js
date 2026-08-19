import { supabase } from '@/lib/supabase'

export async function getUserAccess(userId) {
  var res = await supabase.from('resource_access').select('*').eq('user_id', userId)
  if (res.error) throw res.error
  return res.data || []
}

export async function grantAccess(orgId, userId, resourceType, resourceId) {
  var res = await supabase.from('resource_access').insert({
    org_id: orgId, user_id: userId, resource_type: resourceType, resource_id: resourceId,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

export async function revokeAccess(userId, resourceType, resourceId) {
  var res = await supabase.from('resource_access')
    .delete()
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
  if (res.error) throw res.error
  return true
}
