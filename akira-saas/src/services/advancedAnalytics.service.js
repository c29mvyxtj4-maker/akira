/**
 * Advanced Analytics & Custom Reports Service
 *
 * Custom report builder, data aggregation, BI integrations
 * Performance metrics, revenue analytics, team productivity
 */

import { supabase } from '@/lib/supabase'

// ========================================
// CUSTOM REPORTS
// ========================================

export const REPORT_TEMPLATES = {
  REVENUE_SUMMARY: {
    id: 'revenue_summary',
    name: 'Revenue Summary',
    metrics: ['total_revenue', 'mrr', 'arr', 'growth_rate'],
    dimensions: ['month', 'client', 'project_type'],
  },
  PROJECT_PROFITABILITY: {
    id: 'project_profitability',
    name: 'Project Profitability',
    metrics: ['revenue', 'cost', 'margin', 'margin_percent'],
    dimensions: ['project', 'client', 'team_member'],
  },
  TIME_TRACKING_ANALYTICS: {
    id: 'time_tracking',
    name: 'Time Tracking Analytics',
    metrics: ['total_hours', 'billable_hours', 'utilization', 'rate_average'],
    dimensions: ['team_member', 'project', 'week'],
  },
  TEAM_PRODUCTIVITY: {
    id: 'team_productivity',
    name: 'Team Productivity',
    metrics: ['hours_logged', 'tasks_completed', 'projects_active', 'efficiency'],
    dimensions: ['team_member', 'week', 'project'],
  },
  CLIENT_HEALTH: {
    id: 'client_health',
    name: 'Client Health Score',
    metrics: ['engagement', 'revenue_growth', 'churn_risk', 'nps'],
    dimensions: ['client', 'account_manager'],
  },
}

// ========================================
// REPORT BUILDER
// ========================================

/**
 * Create custom report
 */
export async function createReport(name, template, filters = {}, schedule = null) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('reports')
    .insert([{
      user_id: userId,
      name,
      template,
      filters: JSON.stringify(filters),
      schedule: schedule ? JSON.stringify(schedule) : null,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user's reports
 */
export async function getReports() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Run report
 */
export async function runReport(reportId) {
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report) throw new Error('Report not found')

  const filters = JSON.parse(report.filters || '{}')
  const templateConfig = REPORT_TEMPLATES[report.template]

  // Aggregate data
  const data = await aggregateReportData(templateConfig, filters)

  return {
    report_id: reportId,
    template: report.template,
    metrics: data,
    generated_at: new Date().toISOString(),
  }
}

/**
 * Aggregate report data
 */
async function aggregateReportData(template, filters) {
  const metrics = {}

  // Fetch metric data based on dimensions
  for (const metric of template.metrics) {
    metrics[metric] = await fetchMetric(metric, template.dimensions, filters)
  }

  return metrics
}

/**
 * Fetch individual metric
 */
async function fetchMetric(metric, dimensions, filters) {
  let query = supabase
    .from('metrics_cache')
    .select('*')
    .eq('metric_name', metric)

  // Apply filters
  if (filters.date_from) {
    query = query.gte('date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('date', filters.date_to)
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.client_id) {
    query = query.eq('client_id', filters.client_id)
  }

  const { data } = await query

  return {
    current: data?.[0]?.value || 0,
    previous: data?.[1]?.value || 0,
    trend: calculateTrend(data?.[0]?.value, data?.[1]?.value),
  }
}

/**
 * Calculate trend
 */
function calculateTrend(current, previous) {
  if (!previous) return 0
  return ((current - previous) / previous * 100).toFixed(1)
}

/**
 * Schedule report delivery
 */
export async function scheduleReportDelivery(reportId, schedule, recipients) {
  const { error } = await supabase
    .from('scheduled_reports')
    .insert([{
      report_id: reportId,
      schedule: JSON.stringify(schedule),
      recipients: JSON.stringify(recipients),
      is_active: true,
      created_at: new Date().toISOString(),
    }])

  if (error) throw error
}

// ========================================
// BI INTEGRATION
// ========================================

/**
 * Export data for BI tool
 */
export async function exportToBITool(reportId, biTool = 'tableau') {
  const report = await runReport(reportId)

  // Format for BI tool
  const formatted = formatForBITool(report, biTool)

  return {
    data: formatted,
    export_format: biTool,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Format data for BI tool
 */
function formatForBITool(report, tool) {
  switch (tool) {
    case 'tableau':
      return formatForTableau(report)
    case 'power_bi':
      return formatForPowerBI(report)
    case 'looker':
      return formatForLooker(report)
    default:
      return report
  }
}

// BI Tool formatters (stubs)
function formatForTableau(report) { return report }
function formatForPowerBI(report) { return report }
function formatForLooker(report) { return report }

// ========================================
// DASHBOARD BUILDER
// ========================================

/**
 * Create custom dashboard
 */
export async function createDashboard(name, widgets = []) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('dashboards')
    .insert([{
      user_id: userId,
      name,
      widgets: JSON.stringify(widgets),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get dashboards
 */
export async function getDashboards() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Add widget to dashboard
 */
export async function addDashboardWidget(dashboardId, widget) {
  const { data: dashboard } = await supabase
    .from('dashboards')
    .select('widgets')
    .eq('id', dashboardId)
    .single()

  const widgets = JSON.parse(dashboard.widgets || '[]')
  widgets.push(widget)

  return supabase
    .from('dashboards')
    .update({ widgets: JSON.stringify(widgets) })
    .eq('id', dashboardId)
}

/**
 * Remove widget from dashboard
 */
export async function removeDashboardWidget(dashboardId, widgetId) {
  const { data: dashboard } = await supabase
    .from('dashboards')
    .select('widgets')
    .eq('id', dashboardId)
    .single()

  const widgets = JSON.parse(dashboard.widgets || '[]').filter(w => w.id !== widgetId)

  return supabase
    .from('dashboards')
    .update({ widgets: JSON.stringify(widgets) })
    .eq('id', dashboardId)
}

// ========================================
// PERFORMANCE METRICS
// ========================================

/**
 * Get KPI summary
 */
export async function getKPISummary(timeframe = '30d') {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('kpi_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('timeframe', timeframe)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || {
    revenue: 0,
    projects_active: 0,
    team_members: 0,
    client_satisfaction: 0,
  }
}

/**
 * Calculate cohort analysis
 */
export async function getCohortAnalysis(cohortSize = 'monthly') {
  // Group users by signup date
  // Calculate retention over time
  // Return cohort matrix

  const { data } = await supabase
    .from('users')
    .select('created_at')

  // TODO: Implement cohort calculation
  return {}
}
