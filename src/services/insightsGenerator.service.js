/**
 * Insights Generator Service (Phase 9)
 *
 * Automated business insights, anomaly alerts, recommendations, action items
 */

import { supabase } from '@/lib/supabase'

// ========================================
// INSIGHT GENERATION
// ========================================

/**
 * Generate daily insights
 */
export async function generateDailyInsights() {
  const { userId } = await supabase.auth.getUser()

  const insights = {
    timestamp: new Date().toISOString(),
    userId,
    insights: [],
    alerts: [],
    opportunities: [],
    recommendations: [],
  }

  // Check for anomalies
  const anomalies = await detectTodayAnomalies()
  if (anomalies.length > 0) {
    insights.alerts.push(...anomalies)
  }

  // Check for opportunities
  const opportunities = await findOpportunities()
  if (opportunities.length > 0) {
    insights.opportunities.push(...opportunities)
  }

  // Generate recommendations
  const recommendations = await generateRecommendations()
  if (recommendations.length > 0) {
    insights.recommendations.push(...recommendations)
  }

  // Store insights
  await supabase
    .from('insights')
    .insert([insights])

  return insights
}

/**
 * Detect anomalies in today's data
 */
async function detectTodayAnomalies() {
  const today = new Date().toISOString().slice(0, 10)

  const { data: todayMetrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('date', today)

  if (!todayMetrics || todayMetrics.length === 0) return []

  const { data: historicalMetrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .lt('date', today)
    .order('date', { ascending: false })
    .limit(30)

  const anomalies = []

  for (const metric of todayMetrics) {
    const historical = historicalMetrics.filter(h => h.metric === metric.metric)
    const mean = calculateMean(historical.map(h => h.value))
    const stdDev = calculateStdDev(historical.map(h => h.value))
    const zscore = (metric.value - mean) / stdDev

    if (Math.abs(zscore) > 2) {
      anomalies.push({
        type: 'anomaly',
        severity: Math.abs(zscore) > 3 ? 'critical' : 'warning',
        metric: metric.metric,
        value: metric.value,
        expected: Math.round(mean),
        zscore: Math.round(zscore * 100) / 100,
        message: `${metric.metric} is ${Math.abs(zscore) > 3 ? 'critically' : ''} outside normal range`,
      })
    }
  }

  return anomalies
}

/**
 * Find business opportunities
 */
async function findOpportunities() {
  const opportunities = []

  // Opportunity 1: Upsell to VIP clients
  const { data: vipClients } = await supabase
    .from('clients')
    .select('id, name')
    .order('total_revenue', { ascending: false })
    .limit(10)

  for (const client of vipClients) {
    const avgProjectSize = await getAverageProjectSize(client.id)
    const maxProjectSize = await getMaxProjectSize(client.id)

    if (maxProjectSize > avgProjectSize * 1.5) {
      opportunities.push({
        type: 'upsell',
        priority: 'high',
        client: client.name,
        message: `${client.name} has shown interest in larger projects (${maxProjectSize}). Consider proposing additional services.`,
      })
    }
  }

  // Opportunity 2: Expand to related services
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .limit(20)

  for (const project of activeProjects) {
    const daysActive = daysSince(project.created_at)
    if (daysActive > 90) {
      opportunities.push({
        type: 'expansion',
        priority: 'medium',
        project: project.name,
        message: `Project has been running for ${daysActive} days. Consider proposing maintenance or enhancement services.`,
      })
    }
  }

  return opportunities
}

/**
 * Generate actionable recommendations
 */
async function generateRecommendations() {
  const recommendations = []

  // Recommendation 1: Revenue optimization
  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('id, amount')
    .eq('status', 'pending')
    .gte('created_at', getMonthsAgo(1))

  if (unpaidInvoices && unpaidInvoices.length > 0) {
    const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0)
    recommendations.push({
      type: 'action',
      priority: 'high',
      category: 'revenue',
      title: 'Follow up on unpaid invoices',
      message: `You have $${totalUnpaid} in unpaid invoices from the last 30 days. Consider sending reminders.`,
      action: 'follow_up_invoices',
      impact: `Potential recovery: $${totalUnpaid}`,
    })
  }

  // Recommendation 2: Time tracking improvement
  const { data: entries } = await supabase
    .from('time_entries')
    .select('billable')
    .eq('billable', false)
    .gte('created_at', getMonthsAgo(1))

  const totalNonBillable = entries?.length || 0
  const billableRate = ((entries?.filter(e => e.billable).length || 0) / (entries?.length || 1) * 100).toFixed(1)

  if (billableRate < 80) {
    recommendations.push({
      type: 'action',
      priority: 'medium',
      category: 'efficiency',
      title: 'Improve billable rate',
      message: `Your billable rate is ${billableRate}%. Industry average is 85%. Consider adjusting project scopes or rates.`,
      action: 'review_billable_rate',
      impact: `Potential revenue increase: 5-10%`,
    })
  }

  // Recommendation 3: Customer health
  const churnRiskClients = await getChurnRiskClients()
  if (churnRiskClients.length > 0) {
    recommendations.push({
      type: 'action',
      priority: 'critical',
      category: 'retention',
      title: 'Customer at-risk alerts',
      message: `${churnRiskClients.length} customers showing churn signals. Reach out proactively.`,
      action: 'address_churn_risk',
      affectedClients: churnRiskClients,
    })
  }

  return recommendations
}

// ========================================
// ALERTS & NOTIFICATIONS
// ========================================

/**
 * Create alert
 */
export async function createAlert(alertType, severity, message, actionRequired = false) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('alerts')
    .insert([{
      user_id: userId,
      type: alertType,
      severity,
      message,
      action_required: actionRequired,
      is_read: false,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Send notification if critical
  if (severity === 'critical') {
    await sendNotification(userId, message, 'alert')
  }

  return data
}

/**
 * Get user alerts
 */
export async function getUserAlerts(unreadOnly = true) {
  const { userId } = await supabase.auth.getUser()

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId) {
  await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', alertId)
}

/**
 * Dismiss alert
 */
export async function dismissAlert(alertId) {
  await supabase
    .from('alerts')
    .update({ dismissed: true })
    .eq('id', alertId)
}

// ========================================
// PREDICTIVE ALERTS
// ========================================

/**
 * Churn alert - customer at risk
 */
export async function checkChurnRisk() {
  const { userId } = await supabase.auth.getUser()

  const churnRiskClients = await getChurnRiskClients()

  for (const client of churnRiskClients) {
    await createAlert(
      'churn_risk',
      'high',
      `${client.name} is showing signs of churn (${client.riskScore}% risk). Reach out proactively.`,
      true
    )
  }

  return churnRiskClients.length
}

/**
 * Revenue at-risk alert
 */
export async function checkRevenueAtRisk() {
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('status', 'pending')
    .lte('due_date', new Date().toISOString())

  const overdue = pendingInvoices?.reduce((sum, i) => sum + i.amount, 0) || 0

  if (overdue > 10000) {
    await createAlert(
      'revenue_at_risk',
      'critical',
      `$${overdue} in overdue invoices. Immediate action required.`,
      true
    )
  }

  return overdue
}

/**
 * Utilization alert
 */
export async function checkUtilizationRate() {
  const { data: entries } = await supabase
    .from('time_entries')
    .select('duration_seconds')
    .gte('created_at', getMonthsAgo(1))

  const totalHours = entries.reduce((sum, e) => sum + (e.duration_seconds / 3600), 0)
  const workDays = 20 // Days per month
  const avgDaily = totalHours / workDays
  const targetDaily = 8

  const utilization = (avgDaily / targetDaily * 100).toFixed(1)

  if (utilization < 60) {
    await createAlert(
      'low_utilization',
      'medium',
      `Utilization rate is ${utilization}%. Consider addressing capacity gaps.`,
      false
    )
  }

  return utilization
}

// ========================================
// SCORECARD GENERATION
// ========================================

/**
 * Generate business health scorecard
 */
export async function generateBusinessScorecard() {
  const scores = {}

  // Revenue health
  const revenueTrend = await getTrendScore('revenue')
  scores.revenue = revenueTrend.score

  // Customer health
  const customerCount = await getActiveCustomerCount()
  const churnRiskCount = (await getChurnRiskClients()).length
  scores.customer = (1 - (churnRiskCount / Math.max(1, customerCount))) * 100

  // Operational efficiency
  const billableRate = await getBillableRate()
  scores.efficiency = billableRate

  // Financial health
  const profitMargin = await getProfitMargin()
  scores.financial = profitMargin

  // Overall score
  const overallScore = (
    (scores.revenue * 0.3) +
    (scores.customer * 0.3) +
    (scores.efficiency * 0.2) +
    (scores.financial * 0.2)
  ).toFixed(1)

  return {
    overallScore,
    scorecard: scores,
    health: overallScore > 75 ? 'excellent' : overallScore > 50 ? 'good' : 'at_risk',
    lastUpdated: new Date().toISOString(),
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function calculateMean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length || 0
}

function calculateStdDev(values) {
  const mean = calculateMean(values)
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000))
}

function getMonthsAgo(months) {
  return new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString()
}

async function getAverageProjectSize(clientId) { return 0 }
async function getMaxProjectSize(clientId) { return 0 }
async function getChurnRiskClients() { return [] }
async function sendNotification(userId, message, type) { }
async function getTrendScore(metric) { return { score: 75 } }
async function getActiveCustomerCount() { return 0 }
async function getBillableRate() { return 0 }
async function getProfitMargin() { return 0 }
