import { supabase } from '@/lib/supabase'

export async function fetchDashboards(orgId) {
  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchDefaultDashboard(orgId, userId) {
  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createDashboard(dashboard) {
  const { data, error } = await supabase
    .from('dashboards')
    .insert(dashboard)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDashboard(id, updates) {
  const { data, error } = await supabase
    .from('dashboards')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDashboard(id) {
  const { error } = await supabase
    .from('dashboards')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchDashboardWidgets(dashboardId) {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .eq('dashboard_id', dashboardId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

export async function addWidget(dashboardId, widget) {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert({
      dashboard_id: dashboardId,
      widget_type: widget.type,
      position: widget.position,
      size: widget.size,
      config: widget.config,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWidget(id, updates) {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeWidget(id) {
  const { error } = await supabase
    .from('dashboard_widgets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderWidgets(dashboardId, widgets) {
  const updates = widgets.map((w, idx) =>
    supabase
      .from('dashboard_widgets')
      .update({ position: idx })
      .eq('id', w.id)
  )

  await Promise.all(updates)
}
