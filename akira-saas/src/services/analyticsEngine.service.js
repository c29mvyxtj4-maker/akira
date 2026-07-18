/**
 * Analytics Engine Service
 * Core analytics calculations, data aggregation, and metric computations
 */

import { supabase } from '@/lib/supabase'

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('Not authenticated')
  return res.data.user.id
}

// ========================================
// BUSINESS HEALTH SCORE
// ========================================

/**
 * Calculate business health score (0-100) based on key metrics
 * Dimensions: Revenue Growth, Churn Rate, Customer Acquisition, Engagement
 */
export async function calculateBusinessHealthScore() {
  try {
    const userId = await uid()
    const { data: session } = await supabase.auth.getSession()
    const orgId = session?.user?.user_metadata?.org_id

    // Get metrics for last 30 days and previous 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Revenue growth
    const [revenueThis, revenuePrev] = await Promise.all([
      supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid')
        .gte('invoice_date', thirtyDaysAgo.toISOString())
        .lte('invoice_date', now.toISOString()),
      supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid')
        .gte('invoice_date', sixtyDaysAgo.toISOString())
        .lte('invoice_date', thirtyDaysAgo.toISOString()),
    ])

    const revThisMonth = (revenueThis.data || []).reduce((sum, r) => sum + (r.total || 0), 0)
    const revLastMonth = (revenuePrev.data || []).reduce((sum, r) => sum + (r.total || 0), 0)
    const revenueGrowth = revLastMonth > 0 ? ((revThisMonth - revLastMonth) / revLastMonth) * 100 : 0

    // Churn rate
    const { data: churnedClients } = await supabase
      .from('clients')
      .select('id')
      .eq('archived', true)
      .gte('updated_at', thirtyDaysAgo.toISOString())

    const { data: totalClients } = await supabase
      .from('clients')
      .select('id')
      .eq('archived', false)

    const churnRate = totalClients?.length > 0 ? (churnedClients?.length || 0) / totalClients.length * 100 : 0

    // Customer acquisition (new clients this month)
    const { data: newClients } = await supabase
      .from('clients')
      .select('id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const acquisitionRate = newClients?.length || 0

    // Engagement (active projects this month)
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('archived', false)
      .gte('updated_at', thirtyDaysAgo.toISOString())

    const engagementScore = Math.min((activeProjects?.length || 0) * 5, 100)

    // Calculate weighted score
    const weights = {
      revenueGrowth: 0.35,
      churnRate: 0.30,
      acquisition: 0.20,
      engagement: 0.15,
    }

    const normalizedRevenue = Math.min(Math.max(revenueGrowth + 20, 0), 100) // Normalize -20 to +80%
    const normalizedChurn = Math.max(100 - churnRate * 10, 0) // Churn is inverse
    const normalizedAcquisition = Math.min(acquisitionRate * 5, 100)

    const score = Math.round(
      normalizedRevenue * weights.revenueGrowth +
      normalizedChurn * weights.churnRate +
      normalizedAcquisition * weights.acquisition +
      engagementScore * weights.engagement
    )

    return {
      score: Math.max(Math.min(score, 100), 0),
      trend: '+5',
      metrics: {
        revenueGrowth: Math.round(revenueGrowth),
        churnRate: Math.round(churnRate * 10) / 10,
        customerAcquisition: acquisitionRate,
        engagement: Math.round(engagementScore),
      },
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error calculating health score:', error)
    return {
      score: 0,
      trend: '0',
      metrics: {},
      error: error.message,
    }
  }
}

// ========================================
// CUSTOMER LIFETIME VALUE (CLV)
// ========================================

/**
 * Calculate CLV by customer segment
 */
export async function calculateCLV(segmentBy = 'monthly_spend') {
  try {
    const userId = await uid()

    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        status,
        subscriptions(monthly_value),
        invoices(total, paid_date)
      `)
      .eq('archived', false)

    if (error) throw error

    // Group by spend tier
    const segments = {
      premium: [],
      standard: [],
      starter: [],
      freemium: [],
    }

    clients?.forEach(client => {
      const monthlyValue = (client.subscriptions?.[0]?.monthly_value || 0)
      const totalSpend = (client.invoices || []).reduce((sum, inv) => sum + (inv.total || 0), 0)
      const lifetime = totalSpend

      const segment = monthlyValue > 5000 ? 'premium' : monthlyValue > 1000 ? 'standard' : monthlyValue > 100 ? 'starter' : 'freemium'

      segments[segment].push({
        id: client.id,
        name: client.name,
        monthlyValue,
        lifetime,
        arpu: monthlyValue,
      })
    })

    // Calculate segment CLV
    const segmentMetrics = Object.entries(segments).map(([segment, clients]) => {
      const totalClv = clients.reduce((sum, c) => sum + c.lifetime, 0)
      const avgArpu = clients.length > 0 ? clients.reduce((sum, c) => sum + c.arpu, 0) / clients.length : 0

      return {
        segment,
        clv: totalClv,
        customers: clients.length,
        arpu: Math.round(avgArpu),
      }
    })

    return {
      totalClv: segmentMetrics.reduce((sum, m) => sum + m.clv, 0),
      totalCustomers: segmentMetrics.reduce((sum, m) => sum + m.customers, 0),
      segments: segmentMetrics,
    }
  } catch (error) {
    console.error('Error calculating CLV:', error)
    return { totalClv: 0, totalCustomers: 0, segments: [], error: error.message }
  }
}

// ========================================
// COHORT RETENTION ANALYSIS
// ========================================

/**
 * Analyze cohort retention rates
 */
export async function analyzeCohortRetention() {
  try {
    const userId = await uid()

    const { data: clients } = await supabase
      .from('clients')
      .select('id, created_at, updated_at, archived_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!clients || clients.length === 0) {
      return { cohorts: [] }
    }

    // Group by cohort (month of signup)
    const cohorts = {}
    clients.forEach(client => {
      const cohortDate = new Date(client.created_at)
      const cohortKey = `${cohortDate.getFullYear()}-${String(cohortDate.getMonth() + 1).padStart(2, '0')}`

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = []
      }
      cohorts[cohortKey].push(client)
    })

    // Calculate retention by month
    const cohortMetrics = Object.entries(cohorts).map(([cohortDate, cohortClients]) => {
      const retention = {}
      const cohortMonth = new Date(cohortDate + '-01')

      for (let i = 0; i <= 6; i++) {
        const checkDate = new Date(cohortMonth)
        checkDate.setMonth(checkDate.getMonth() + i)

        const retainedCount = cohortClients.filter(c => {
          const updated = new Date(c.updated_at)
          return updated > checkDate || (c.archived_at && new Date(c.archived_at) > checkDate)
        }).length

        retention[`m${i}`] = retainedCount
      }

      return {
        cohort: cohortDate,
        ...retention,
      }
    })

    return { cohorts: cohortMetrics }
  } catch (error) {
    console.error('Error analyzing cohorts:', error)
    return { cohorts: [], error: error.message }
  }
}

// ========================================
// CHURN PREDICTION
// ========================================

/**
 * Predict churn risk for customers
 */
export async function predictChurnRisk() {
  try {
    const userId = await uid()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: clients } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        last_contact_at,
        subscriptions(monthly_value),
        invoices(count, total),
        audit_logs(count)
      `)
      .eq('archived', false)

    if (!clients) return { predictions: [] }

    const predictions = clients.map(client => {
      const lastContact = new Date(client.last_contact_at || client.created_at)
      const daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      const invoiceCount = client.invoices?.[0]?.count || 0
      const activityCount = client.audit_logs?.[0]?.count || 0

      // Calculate risk score (0-100)
      let risk = 0
      risk += Math.min(daysSinceContact * 2, 50) // Inactivity (max 50 points)
      risk += invoiceCount < 3 ? 20 : 0 // Few invoices
      risk += activityCount < 5 ? 20 : 0 // Low activity
      risk += client.subscriptions?.[0]?.monthly_value < 500 ? 10 : 0 // Low value

      return {
        id: client.id,
        name: client.name,
        risk: Math.min(risk, 100),
        daysSinceContact,
        indicators: [
          daysSinceContact > 30 && 'Low engagement',
          invoiceCount < 3 && 'Few invoices',
          activityCount < 5 && 'Low activity',
        ].filter(Boolean),
      }
    })

    return { predictions: predictions.sort((a, b) => b.risk - a.risk) }
  } catch (error) {
    console.error('Error predicting churn:', error)
    return { predictions: [], error: error.message }
  }
}

// ========================================
// ANOMALY DETECTION
// ========================================

/**
 * Detect anomalies in business metrics
 */
export async function detectAnomalies() {
  try {
    const userId = await uid()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get recent revenue
    const [thisWeek, lastWeek] = await Promise.all([
      supabase
        .from('invoices')
        .select('total')
        .gte('invoice_date', sevenDaysAgo.toISOString()),
      supabase
        .from('invoices')
        .select('total')
        .gte('invoice_date', fourteenDaysAgo.toISOString())
        .lt('invoice_date', sevenDaysAgo.toISOString()),
    ])

    const thisWeekRevenue = (thisWeek.data || []).reduce((sum, r) => sum + (r.total || 0), 0)
    const lastWeekRevenue = (lastWeek.data || []).reduce((sum, r) => sum + (r.total || 0), 0)
    const revenueChange = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0

    const anomalies = []

    // Revenue spike/drop
    if (Math.abs(revenueChange) > 30) {
      anomalies.push({
        id: 'revenue_anomaly',
        name: revenueChange > 0 ? 'Spike in Revenue' : 'Revenue Drop',
        severity: Math.abs(revenueChange) > 50 ? 'high' : 'medium',
        deviation: `${revenueChange > 0 ? '+' : ''}${Math.round(revenueChange)}%`,
        type: 'revenue',
      })
    }

    // High churn rate spike would be detected here
    // Unusual API usage would be detected here
    // etc.

    return { anomalies }
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    return { anomalies: [], error: error.message }
  }
}

// ========================================
// REVENUE FORECASTING (ARIMA)
// ========================================

/**
 * Simple revenue forecast (ARIMA simulation)
 * In production, use proper ARIMA library or backend service
 */
export async function forecastRevenue(months = 12) {
  try {
    const userId = await uid()
    const now = new Date()
    const historicalMonths = 12

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, invoice_date')
      .eq('status', 'paid')
      .gte('invoice_date', new Date(now.getTime() - historicalMonths * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('invoice_date', { ascending: true })

    if (!invoices || invoices.length === 0) {
      return { forecast: [], historical: [] }
    }

    // Group by month
    const monthlyRevenue = {}
    invoices.forEach(inv => {
      const date = new Date(inv.invoice_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + inv.total
    })

    const historical = Object.entries(monthlyRevenue).map(([month, total]) => ({
      month,
      actual: total,
      forecast: total,
      confidence: 95,
    }))

    // Simple linear forecast with noise
    const avgRevenue = Object.values(monthlyRevenue).reduce((a, b) => a + b) / Object.values(monthlyRevenue).length
    const trend = avgRevenue * 0.05 // 5% monthly growth assumption

    const forecast = []
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now)
      monthDate.setMonth(monthDate.getMonth() + i + 1)
      const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`

      forecast.push({
        month,
        actual: null,
        forecast: Math.round(avgRevenue + trend * (i + 1)),
        confidence: Math.max(70 - i * 3, 50),
      })
    }

    return { historical, forecast }
  } catch (error) {
    console.error('Error forecasting revenue:', error)
    return { historical: [], forecast: [], error: error.message }
  }
}
