/**
 * Data Visualization Service
 * Chart data transformation, formatting, and aggregation
 */

import { supabase } from '@/lib/supabase'

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('Not authenticated')
  return res.data.user.id
}

// ========================================
// REVENUE VISUALIZATIONS
// ========================================

/**
 * Prepare revenue trend data for line/bar chart
 */
export async function getRevenueTrendData(period = '12m') {
  try {
    const userId = await uid()
    const now = new Date()
    let startDate

    switch (period) {
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '12m':
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, invoice_date, status')
      .eq('status', 'paid')
      .gte('invoice_date', startDate.toISOString())
      .order('invoice_date', { ascending: true })

    if (!invoices) return { data: [] }

    // Group by week or month based on period
    const groupByMonth = period !== '3m'
    const grouped = {}

    invoices.forEach(inv => {
      const date = new Date(inv.invoice_date)
      let key
      if (groupByMonth) {
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      } else {
        const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        key = `W${week + 1}`
      }
      grouped[key] = (grouped[key] || 0) + inv.total
    })

    return {
      data: Object.entries(grouped).map(([period, total]) => ({
        period,
        revenue: total,
      })),
      period,
    }
  } catch (error) {
    console.error('Error getting revenue trend:', error)
    return { data: [], error: error.message }
  }
}

// ========================================
// CUSTOMER SEGMENTATION
// ========================================

/**
 * Prepare customer segmentation for pie/donut chart
 */
export async function getCustomerSegmentationData() {
  try {
    const userId = await uid()

    const { data: clients } = await supabase
      .from('clients')
      .select('id, status, subscriptions(monthly_value)')
      .eq('archived', false)

    if (!clients) return { segments: [] }

    // Segment by monthly spend
    const segments = {
      enterprise: { count: 0, revenue: 0, color: '#e63946' },
      professional: { count: 0, revenue: 0, color: '#f77f00' },
      business: { count: 0, revenue: 0, color: '#06cee9' },
      startup: { count: 0, revenue: 0, color: '#2a9d8f' },
    }

    clients.forEach(client => {
      const monthlyValue = client.subscriptions?.[0]?.monthly_value || 0

      if (monthlyValue > 5000) {
        segments.enterprise.count += 1
        segments.enterprise.revenue += monthlyValue
      } else if (monthlyValue > 2000) {
        segments.professional.count += 1
        segments.professional.revenue += monthlyValue
      } else if (monthlyValue > 500) {
        segments.business.count += 1
        segments.business.revenue += monthlyValue
      } else {
        segments.startup.count += 1
        segments.startup.revenue += monthlyValue
      }
    })

    const data = Object.entries(segments)
      .map(([name, metrics]) => ({
        name,
        value: metrics.count,
        revenue: metrics.revenue,
        color: metrics.color,
        percentage: (metrics.count / clients.length) * 100,
      }))
      .filter(s => s.value > 0)

    return { segments: data }
  } catch (error) {
    console.error('Error getting customer segmentation:', error)
    return { segments: [], error: error.message }
  }
}

// ========================================
// PERFORMANCE METRICS
// ========================================

/**
 * Prepare KPI time series data
 */
export async function getPerformanceMetricsData(metric = 'churn_rate', period = '12m') {
  try {
    const userId = await uid()
    const now = new Date()
    const monthsBack = period === '3m' ? 3 : period === '6m' ? 6 : 12
    const startDate = new Date(now.getTime() - monthsBack * 30 * 24 * 60 * 60 * 1000)

    let data = []

    if (metric === 'churn_rate') {
      // Calculate monthly churn rates
      const { data: clients } = await supabase
        .from('clients')
        .select('id, created_at, archived_at')

      if (clients) {
        const monthlyChurns = {}
        for (let i = 0; i < monthsBack; i++) {
          const monthDate = new Date(now)
          monthDate.setMonth(monthDate.getMonth() - i)
          const key = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

          const churned = clients.filter(c => {
            if (!c.archived_at) return false
            const archivedDate = new Date(c.archived_at)
            return archivedDate.getMonth() === monthDate.getMonth() &&
              archivedDate.getFullYear() === monthDate.getFullYear()
          }).length

          const active = clients.filter(c => new Date(c.created_at) <= monthDate && !c.archived_at).length
          monthlyChurns[key] = active > 0 ? (churned / active) * 100 : 0
        }

        data = Object.entries(monthlyChurns)
          .reverse()
          .map(([month, rate]) => ({
            month,
            value: Math.round(rate * 10) / 10,
          }))
      }
    } else if (metric === 'nps' || metric === 'engagement') {
      // Mock data for other metrics
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        data.push({
          month,
          value: Math.floor(Math.random() * 40) + 60,
        })
      }
    }

    return { data, metric, period }
  } catch (error) {
    console.error('Error getting performance metrics:', error)
    return { data: [], error: error.message }
  }
}

// ========================================
// COHORT RETENTION CHART DATA
// ========================================

/**
 * Prepare cohort analysis heatmap data
 */
export async function getCohortRetentionChartData() {
  try {
    const userId = await uid()

    const { data: clients } = await supabase
      .from('clients')
      .select('id, created_at, updated_at')
      .eq('archived', false)

    if (!clients) return { cohorts: [] }

    // Group by signup month
    const cohorts = {}
    clients.forEach(client => {
      const created = new Date(client.created_at)
      const cohortKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = []
      }
      cohorts[cohortKey].push(client)
    })

    // Calculate retention matrix
    const data = Object.entries(cohorts).map(([cohortMonth, cohortClients]) => {
      const cohortDate = new Date(cohortMonth + '-01')
      const retention = { cohort: cohortMonth }

      for (let month = 0; month <= 6; month++) {
        const checkDate = new Date(cohortDate)
        checkDate.setMonth(checkDate.getMonth() + month)

        const retained = cohortClients.filter(c => {
          const updated = new Date(c.updated_at)
          return updated > checkDate
        }).length

        const rate = Math.round((retained / cohortClients.length) * 100)
        retention[`m${month}`] = rate
      }

      return retention
    })

    return { cohorts: data }
  } catch (error) {
    console.error('Error getting cohort retention data:', error)
    return { cohorts: [], error: error.message }
  }
}

// ========================================
// WATERFALL CHART DATA (Revenue Attribution)
// ========================================

/**
 * Prepare revenue breakdown waterfall data
 */
export async function getRevenueBreakdownData() {
  try {
    const userId = await uid()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')
      .gte('invoice_date', startOfMonth.toISOString())

    if (!invoices) return { breakdown: [] }

    // Group by service/category
    const breakdown = {}
    invoices.forEach(inv => {
      const category = inv.description?.split('-')[0] || 'Other'
      breakdown[category] = (breakdown[category] || 0) + inv.total
    })

    const data = Object.entries(breakdown)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    data.unshift({ category: 'Beginning', amount: 0 })
    data.push({ category: 'Total', amount: total })

    return { breakdown: data }
  } catch (error) {
    console.error('Error getting revenue breakdown:', error)
    return { breakdown: [], error: error.message }
  }
}

// ========================================
// BENCHMARK DATA
// ========================================

/**
 * Get industry benchmark comparisons
 */
export async function getBenchmarkData() {
  try {
    // These would come from your industry benchmark database
    const benchmarks = {
      churnRate: { industry: 5.2, company: 2.3, percentile: 85 },
      clv: { industry: 45000, company: 67500, percentile: 78 },
      nps: { industry: 42, company: 58, percentile: 91 },
      caRatio: { industry: 3.5, company: 4.2, percentile: 72 },
    }

    return { benchmarks }
  } catch (error) {
    console.error('Error getting benchmarks:', error)
    return { benchmarks: {}, error: error.message }
  }
}

// ========================================
// EXPORT/DOWNLOAD DATA
// ========================================

/**
 * Prepare data for export in various formats
 */
export async function prepareExportData(format = 'csv') {
  try {
    const userId = await uid()

    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('archived', false)

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')

    const exportData = {
      clients: clients || [],
      invoices: invoices || [],
      exportedAt: new Date().toISOString(),
    }

    if (format === 'csv') {
      return { data: exportData, format: 'csv', fileName: `analytics-export-${Date.now()}.csv` }
    } else if (format === 'json') {
      return { data: JSON.stringify(exportData, null, 2), format: 'json', fileName: `analytics-export-${Date.now()}.json` }
    }

    return { data: exportData, format }
  } catch (error) {
    console.error('Error preparing export:', error)
    return { data: null, error: error.message }
  }
}
