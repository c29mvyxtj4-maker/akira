import { supabase } from '@/lib/supabase'

export async function fetchDashboards() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  return supabase
    .from('dashboards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
}

export async function getDashboard(dashboardId) {
  return supabase
    .from('dashboards')
    .select('*')
    .eq('id', dashboardId)
    .single()
}

export async function saveDashboard(dashboard) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (dashboard.id) {
    // Update existing
    return supabase
      .from('dashboards')
      .update({
        name: dashboard.name,
        widgets: dashboard.widgets,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dashboard.id)
      .select()
  } else {
    // Create new
    return supabase
      .from('dashboards')
      .insert({
        user_id: user.id,
        name: dashboard.name,
        widgets: dashboard.widgets,
      })
      .select()
  }
}

export async function deleteDashboard(dashboardId) {
  return supabase
    .from('dashboards')
    .delete()
    .eq('id', dashboardId)
}

export async function shareDashboard(dashboardId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create share token
  const { data } = await supabase
    .from('dashboard_shares')
    .insert({
      dashboard_id: dashboardId,
      created_by: user.id,
      token: Math.random().toString(36).substr(2, 9),
    })
    .select('token')
    .single()

  return `${window.location.origin}/dashboard/shared/${data.token}`
}

export async function getSharedDashboard(token) {
  const { data: share } = await supabase
    .from('dashboard_shares')
    .select('dashboard_id')
    .eq('token', token)
    .single()

  if (!share) throw new Error('Share not found')

  return getDashboard(share.dashboard_id)
}

export async function duplicateDashboard(dashboardId) {
  const { data: original } = await getDashboard(dashboardId)
  if (!original) throw new Error('Dashboard not found')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  return supabase
    .from('dashboards')
    .insert({
      user_id: user.id,
      name: `${original.name} (Copia)`,
      widgets: original.widgets,
    })
    .select()
}
