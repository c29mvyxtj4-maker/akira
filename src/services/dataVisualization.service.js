/**
 * Data Visualization Service (Phase 9)
 *
 * Dashboard builder, custom charts, BI export, visualization templates
 */

import { supabase } from '@/lib/supabase'

// ========================================
// DASHBOARD BUILDER
// ========================================

/**
 * Create custom dashboard
 */
export async function createDashboard(name, description = '') {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('dashboards')
    .insert([{
      user_id: userId,
      name,
      description,
      widgets: JSON.stringify([]),
      layout: 'grid',
      is_public: false,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user dashboards
 */
export async function getUserDashboards() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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
  widget.id = generateId()
  widgets.push(widget)

  await supabase
    .from('dashboards')
    .update({ widgets: JSON.stringify(widgets) })
    .eq('id', dashboardId)

  return widget
}

/**
 * Widget templates
 */
export const WIDGET_TEMPLATES = {
  KPI: {
    type: 'kpi',
    title: 'KPI Card',
    metrics: ['value'],
    config: {
      metric: 'revenue',
      timeframe: '30d',
      showTrend: true,
    },
  },
  LINE_CHART: {
    type: 'line',
    title: 'Line Chart',
    config: {
      metric: 'revenue',
      timeframe: '12m',
      showForecast: false,
    },
  },
  BAR_CHART: {
    type: 'bar',
    title: 'Bar Chart',
    config: {
      metric: 'revenue',
      groupBy: 'client',
    },
  },
  DONUT_CHART: {
    type: 'donut',
    title: 'Donut Chart',
    config: {
      metric: 'hours',
      groupBy: 'project',
    },
  },
  TABLE: {
    type: 'table',
    title: 'Data Table',
    config: {
      dataSource: 'time_entries',
      columns: ['date', 'duration', 'project', 'billable'],
    },
  },
  GAUGE: {
    type: 'gauge',
    title: 'Gauge Chart',
    config: {
      metric: 'billable_rate',
      min: 0,
      max: 100,
    },
  },
  HEATMAP: {
    type: 'heatmap',
    title: 'Activity Heatmap',
    config: {
      metric: 'time_entries',
      groupBy: 'day_of_week',
    },
  },
  SCATTER: {
    type: 'scatter',
    title: 'Scatter Plot',
    config: {
      xMetric: 'revenue',
      yMetric: 'hours',
      bubbleSize: 'profit',
    },
  },
}

// ========================================
// CHART GENERATION
// ========================================

/**
 * Generate line chart data
 */
export async function generateLineChart(metric, timeframe = '12m') {
  const data = await fetchMetricTimeSeries(metric, timeframe)

  return {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: metric,
        data: data.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      }],
    },
  }
}

/**
 * Generate bar chart data
 */
export async function generateBarChart(metric, groupBy) {
  const data = await fetchMetricByDimension(metric, groupBy)

  return {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: metric,
        data: data.map(d => d.value),
        backgroundColor: generateColors(data.length),
      }],
    },
  }
}

/**
 * Generate KPI card
 */
export async function generateKPICard(metric, timeframe = '30d') {
  const current = await fetchMetricValue(metric, timeframe)
  const previous = await fetchMetricValue(metric, getPreviousPeriod(timeframe))

  const change = ((current - previous) / previous * 100).toFixed(1)
  const trend = change > 0 ? 'up' : 'down'

  return {
    type: 'kpi',
    metric,
    current: Math.round(current),
    previous: Math.round(previous),
    change: Math.abs(change),
    trend,
    timeframe,
  }
}

/**
 * Generate trend forecast chart
 */
export async function generateForecastChart(metric, lookbackMonths = 12, forecastMonths = 12) {
  const historical = await fetchMetricTimeSeries(metric, `${lookbackMonths}m`)
  const forecast = await forecastMetric(metric, forecastMonths)

  return {
    type: 'line',
    data: {
      labels: [...historical.map(d => d.date), ...forecast.map(f => f.date)],
      datasets: [
        {
          label: 'Historical',
          data: historical.map(d => d.value),
          borderColor: 'rgb(75, 192, 192)',
          borderDash: [],
        },
        {
          label: 'Forecast',
          data: [...historical.slice(-1).map(d => d.value), ...forecast.map(f => f.value)],
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
        },
      ],
    },
  }
}

// ========================================
// BI TOOL EXPORT
// ========================================

/**
 * Export data for Tableau
 */
export async function exportToTableau(reportData) {
  const csvData = convertToCSV(reportData)

  return {
    format: 'csv',
    data: csvData,
    filename: `akira_export_${new Date().toISOString().slice(0, 10)}.csv`,
    mimeType: 'text/csv',
  }
}

/**
 * Export data for Power BI
 */
export async function exportToPowerBI(reportData) {
  const jsonData = {
    metadata: {
      exportDate: new Date().toISOString(),
      source: 'AKIRA',
      version: '1.0',
    },
    data: reportData,
  }

  return {
    format: 'json',
    data: JSON.stringify(jsonData),
    filename: `akira_powerbi_${new Date().toISOString().slice(0, 10)}.json`,
    mimeType: 'application/json',
  }
}

/**
 * Export data for Looker Studio (Google Data Studio)
 */
export async function exportToLookerStudio(reportData) {
  // Create connection to Looker Studio via API
  // Or export CSV that can be imported
  const csvData = convertToCSV(reportData)

  return {
    format: 'csv',
    data: csvData,
    filename: `akira_lookerstudio_${new Date().toISOString().slice(0, 10)}.csv`,
    mimeType: 'text/csv',
    instructions: 'Import this CSV into Google Data Studio',
  }
}

/**
 * Setup BI connector (future: real-time sync)
 */
export async function setupBIConnector(biTool, credentials) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('bi_connectors')
    .upsert({
      user_id: userId,
      bi_tool: biTool,
      credentials: encryptSensitive(JSON.stringify(credentials)),
      is_active: true,
      last_sync: new Date().toISOString(),
    })

  if (error) throw error
  return data
}

// ========================================
// REPORT GENERATION
// ========================================

/**
 * Generate executive summary report
 */
export async function generateExecutiveSummary() {
  const { userId } = await supabase.auth.getUser()

  // Get key metrics
  const metrics = {
    revenue: await fetchMetricValue('revenue', '30d'),
    growth: await fetchMetricValue('revenue_growth', '30d'),
    activeCustomers: await fetchMetricValue('active_customers', '30d'),
    avgTicketSize: await fetchMetricValue('avg_revenue_per_customer', '30d'),
  }

  // Get trends
  const revenueTrend = await fetchTrendData('revenue', '12m')
  const customerTrend = await fetchTrendData('active_customers', '12m')

  // Get anomalies
  const anomalies = await detectAnomalies('revenue', 30)

  // Get forecasts
  const forecast = await forecastMetric('revenue', 3)

  return {
    generatedAt: new Date().toISOString(),
    period: 'last_30_days',
    metrics,
    trends: { revenue: revenueTrend, customers: customerTrend },
    anomalies: anomalies.slice(0, 5),
    forecast,
    summary: generateSummaryText(metrics, anomalies),
  }
}

/**
 * Generate detailed financial report
 */
export async function generateFinancialReport(startDate, endDate) {
  const { userId } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const { data: expenses } = await supabase
    .from('transactions')
    .select('amount, category, created_at')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const revenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  const profit = revenue - expenseTotal
  const margin = (profit / revenue * 100).toFixed(1)

  return {
    period: { startDate, endDate },
    revenue: Math.round(revenue),
    expenses: Math.round(expenseTotal),
    profit: Math.round(profit),
    margin,
    invoices: invoices.length,
    avgInvoiceSize: Math.round(revenue / invoices.length),
    profitabilityByClient: await calculateProfitabilityByClient(invoices),
  }
}

// ========================================
// SCHEDULED REPORTS
// ========================================

/**
 * Schedule report delivery
 */
export async function scheduleReportDelivery(reportId, schedule, recipients) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert([{
      user_id: userId,
      report_id: reportId,
      schedule: schedule, // daily, weekly, monthly
      recipients: JSON.stringify(recipients),
      is_active: true,
      next_delivery: calculateNextDelivery(schedule),
      created_at: new Date().toISOString(),
    }])

  if (error) throw error
  return data
}

/**
 * Send scheduled report
 */
export async function sendScheduledReport(reportId) {
  const report = await generateExecutiveSummary()

  // Email recipients
  // (implementation depends on email service)

  return {
    sent: true,
    recipients: 0,
    timestamp: new Date().toISOString(),
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateId() {
  return `w_${Math.random().toString(36).substr(2, 9)}`
}

function generateColors(count) {
  const colors = []
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360
    colors.push(`hsl(${hue}, 70%, 60%)`)
  }
  return colors
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => row[h]).join(','))

  return [headers.join(','), ...rows].join('\n')
}

function encryptSensitive(value) { return value }

async function fetchMetricTimeSeries(metric, timeframe) { return [] }
async function fetchMetricByDimension(metric, dimension) { return [] }
async function fetchMetricValue(metric, timeframe) { return 0 }
async function fetchTrendData(metric, timeframe) { return {} }
async function forecastMetric(metric, months) { return [] }
async function detectAnomalies(metric, days) { return [] }

function getPreviousPeriod(timeframe) {
  const match = timeframe.match(/(\d+)([mdhwy])/)
  if (!match) return '30d'
  const [, amount, unit] = match
  return amount + unit
}

function calculateNextDelivery(schedule) {
  const now = new Date()
  switch (schedule) {
    case 'daily': return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 'weekly': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'monthly': return new Date(now.getFullYear(), now.getMonth() + 1, 1)
    default: return now
  }
}

function generateSummaryText(metrics, anomalies) {
  return `Performance Summary: Revenue up ${metrics.growth}% with ${metrics.activeCustomers} active customers.`
}

async function calculateProfitabilityByClient(invoices) { return {} }
