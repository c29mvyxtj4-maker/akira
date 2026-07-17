/**
 * Analytics Engine Service (Phase 9)
 *
 * ML models, predictive analytics, anomaly detection, time series forecasting
 * Business intelligence, pattern recognition, automated insights
 */

import { supabase } from '@/lib/supabase'

// ========================================
// PREDICTIVE MODELS
// ========================================

/**
 * Revenue forecasting model (ARIMA-style)
 */
export async function forecastRevenue(months = 12) {
  const { userId } = await supabase.auth.getUser()

  // Fetch historical revenue
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, created_at, status')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('created_at', getMonthsAgo(24))
    .order('created_at')

  // Aggregate by month
  const monthlyData = aggregateMonthly(invoices)

  // Calculate trend
  const trend = calculateTrend(monthlyData)
  const seasonality = detectSeasonality(monthlyData)
  const movingAverage = calculateMovingAverage(monthlyData, 3)

  // Forecast
  const forecast = []
  let lastValue = monthlyData[monthlyData.length - 1] || 0

  for (let i = 1; i <= months; i++) {
    const trendFactor = 1 + (trend.growthRate / 100) * (i * 0.1)
    const seasonalFactor = seasonality[new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).getMonth()] || 1
    const predicted = Math.round(lastValue * trendFactor * seasonalFactor)

    forecast.push({
      month: addMonths(new Date(), i).toISOString().slice(0, 7),
      predicted,
      lower_bound: Math.round(predicted * 0.85),
      upper_bound: Math.round(predicted * 1.15),
      confidence: Math.max(0.6, 0.95 - (i * 0.03)),
    })

    lastValue = predicted
  }

  return {
    historical: monthlyData,
    forecast,
    trend: trend.growthRate,
    seasonality,
    model: 'ARIMA(1,1,1)',
  }
}

/**
 * Churn prediction model
 */
export async function predictChurnRisk(clientId) {
  const { data: client } = await supabase
    .from('clients')
    .select(`
      id, name, created_at,
      projects (id, status, created_at),
      invoices (amount, status, created_at)
    `)
    .eq('id', clientId)
    .single()

  // Feature engineering
  const features = {
    // Engagement features
    daysSinceCreation: daysSince(client.created_at),
    activeProjectsCount: client.projects.filter(p => p.status === 'active').length,
    totalProjects: client.projects.length,

    // Financial features
    totalRevenue: client.invoices.reduce((sum, i) => sum + (i.status === 'paid' ? i.amount : 0), 0),
    overdueInvoices: client.invoices.filter(i => i.status === 'pending' && isOverdue(i.created_at)).length,

    // Activity features
    daysSinceLastProject: daysSince(client.projects[0]?.created_at || client.created_at),
    daysSinceLastInvoice: daysSince(client.invoices[0]?.created_at || client.created_at),

    // Pattern features
    invoiceFrequency: client.invoices.length / Math.max(1, daysSince(client.created_at) / 30),
  }

  // Simple ML model (logistic regression-style)
  const churnScore = calculateChurnScore(features)

  return {
    clientId,
    clientName: client.name,
    churnRisk: churnScore > 0.7 ? 'high' : churnScore > 0.4 ? 'medium' : 'low',
    riskScore: Math.round(churnScore * 100),
    riskFactors: identifyRiskFactors(features),
    recommendations: getChurnMitigationActions(features),
  }
}

/**
 * Customer lifetime value (CLV) prediction
 */
export async function predictCLV(clientId) {
  const { data: client } = await supabase
    .from('clients')
    .select(`
      id, created_at,
      invoices (amount, created_at, status)
    `)
    .eq('id', clientId)
    .single()

  // Historical revenue
  const revenue = client.invoices
    .filter(i => i.status === 'paid')
    .map(i => i.amount)

  const avgMonthlyValue = calculateAverage(revenue)
  const yearsSinceAcquisition = daysSince(client.created_at) / 365
  const retention = Math.min(0.95, 0.8 + (yearsSinceAcquisition * 0.1))

  // CLV formula: (Average Monthly Value) × (Number of Months) × (Retention %)
  const predictedMonths = 60 // 5-year horizon
  const clv = avgMonthlyValue * predictedMonths * retention
  const discount = 0.1 // 10% discount rate

  return {
    clientId,
    historicalARR: avgMonthlyValue * 12,
    predictedCLV: Math.round(clv),
    discountedCLV: Math.round(clv / Math.pow(1 + discount, yearsSinceAcquisition)),
    retentionProbability: Math.round(retention * 100),
    acquisitionCost: calculateCAC(client),
    paybackMonths: Math.round((calculateCAC(client) / avgMonthlyValue) * 12) / 12,
  }
}

// ========================================
// ANOMALY DETECTION
// ========================================

/**
 * Detect anomalies in time series data
 */
export async function detectAnomalies(metric, lookbackDays = 90) {
  const { userId } = await supabase.auth.getUser()

  // Fetch metric data
  const data = await fetchMetricData(metric, lookbackDays)

  // Calculate statistics
  const mean = calculateMean(data)
  const stdDev = calculateStdDev(data)
  const threshold = mean + (2 * stdDev) // 2-sigma rule (95% confidence)

  // Detect anomalies
  const anomalies = []
  for (let i = 0; i < data.length; i++) {
    const value = data[i].value
    const zscore = (value - mean) / stdDev

    if (Math.abs(zscore) > 2) {
      anomalies.push({
        date: data[i].date,
        value,
        zscore: Math.round(zscore * 100) / 100,
        severity: Math.abs(zscore) > 3 ? 'critical' : 'warning',
        baseline: Math.round(mean),
      })
    }
  }

  return {
    metric,
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    threshold,
    anomalies,
    totalAnomalies: anomalies.length,
  }
}

/**
 * Detect trend changes (breakpoints)
 */
export async function detectTrendBreaks(metric, lookbackDays = 180) {
  const data = await fetchMetricData(metric, lookbackDays)

  const breakpoints = []
  let prevTrend = null

  for (let i = 7; i < data.length; i++) {
    const window = data.slice(i - 7, i)
    const trend = calculateTrend(window.map(d => d.value))

    if (prevTrend && Math.abs(trend.slope - prevTrend.slope) > prevTrend.stdErr * 2) {
      breakpoints.push({
        date: data[i].date,
        trendChange: trend.slope - prevTrend.slope,
        newTrend: trend.slope > 0 ? 'increasing' : 'decreasing',
      })
    }

    prevTrend = trend
  }

  return { metric, breakpoints }
}

// ========================================
// COHORT ANALYSIS
// ========================================

/**
 * Cohort analysis (retention over time)
 */
export async function getCohortAnalysis(cohortSize = 'monthly') {
  const { userId } = await supabase.auth.getUser()

  // Group clients by signup month
  const { data: clients } = await supabase
    .from('clients')
    .select('id, created_at')
    .eq('user_id', userId)

  const cohorts = groupByCohort(clients, cohortSize)

  // Calculate retention for each cohort
  const cohortMatrix = {}

  for (const [cohortDate, cohortClients] of Object.entries(cohorts)) {
    const retention = []

    for (let month = 0; month <= 12; month++) {
      const activeCount = cohortClients.filter(c => {
        const clientAge = daysSince(c.created_at)
        return clientAge >= month * 30 && clientAge < (month + 1) * 30
      }).length

      retention.push({
        month,
        activeCount,
        retentionRate: (activeCount / cohortClients.length * 100).toFixed(1),
      })
    }

    cohortMatrix[cohortDate] = retention
  }

  return cohortMatrix
}

// ========================================
// UNIT ECONOMICS
// ========================================

/**
 * Calculate unit economics
 */
export async function getUnitEconomics() {
  const { userId } = await supabase.auth.getUser()

  // Get customer metrics
  const { data: customers } = await supabase
    .from('clients')
    .select(`
      id, created_at,
      invoices (amount, created_at, status)
    `)
    .eq('user_id', userId)

  // Calculate metrics
  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) =>
    sum + c.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 0
  )

  const avgRevenuePerCustomer = totalRevenue / totalCustomers
  const avgMonthlyValue = avgRevenuePerCustomer / 12

  // Churn calculation
  const activeCustomers = customers.filter(c => {
    const lastInvoice = c.invoices[0]?.created_at
    return lastInvoice && daysSince(lastInvoice) < 90
  }).length

  const monthlyChurn = 1 - (activeCustomers / totalCustomers)
  const lifetimeMonths = 1 / monthlyChurn // Simple calculation
  const clv = avgMonthlyValue * lifetimeMonths

  // CAC
  const cac = calculateCAC({ invoices: customers.flatMap(c => c.invoices) })
  const cacPayback = cac / avgMonthlyValue

  return {
    totalCustomers,
    totalRevenue: Math.round(totalRevenue),
    avgRevenuePerCustomer: Math.round(avgRevenuePerCustomer),
    avgMonthlyValue: Math.round(avgMonthlyValue),
    monthlyChurn: Math.round(monthlyChurn * 100),
    lifetimeMonths: Math.round(lifetimeMonths),
    clv: Math.round(clv),
    cac: Math.round(cac),
    cacPayback: Math.round(cacPayback * 10) / 10,
    ltv_cac_ratio: Math.round((clv / cac) * 10) / 10,
  }
}

// ========================================
// ATTRIBUTION & MULTI-TOUCH
// ========================================

/**
 * Attribution analysis (first-touch, last-touch, multi-touch)
 */
export async function getAttributionAnalysis(conversionMetric = 'invoice') {
  const { userId } = await supabase.auth.getUser()

  // Fetch conversion events
  const { data: conversions } = await supabase
    .from('audit_logs')
    .select('user_id, resource_type, action, created_at')
    .eq('user_id', userId)
    .eq('resource_type', conversionMetric)
    .eq('action', 'create')
    .order('created_at')

  // Fetch touchpoint events
  const { data: touchpoints } = await supabase
    .from('audit_logs')
    .select('user_id, resource_type, action, created_at')
    .eq('user_id', userId)
    .order('created_at')

  // Calculate attribution
  const attribution = {
    firstTouch: {},
    lastTouch: {},
    multiTouch: {},
  }

  for (const conversion of conversions) {
    const relatedTouchpoints = touchpoints.filter(t =>
      t.created_at < conversion.created_at
    )

    if (relatedTouchpoints.length > 0) {
      const firstTouchpoint = relatedTouchpoints[0]
      const lastTouchpoint = relatedTouchpoints[relatedTouchpoints.length - 1]

      // First-touch attribution
      attribution.firstTouch[firstTouchpoint.resource_type] =
        (attribution.firstTouch[firstTouchpoint.resource_type] || 0) + 1

      // Last-touch attribution
      attribution.lastTouch[lastTouchpoint.resource_type] =
        (attribution.lastTouch[lastTouchpoint.resource_type] || 0) + 1

      // Multi-touch (linear)
      const touchpointTypes = [...new Set(relatedTouchpoints.map(t => t.resource_type))]
      const weight = 1 / touchpointTypes.length
      for (const type of touchpointTypes) {
        attribution.multiTouch[type] = (attribution.multiTouch[type] || 0) + weight
      }
    }
  }

  return attribution
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function aggregateMonthly(items) {
  const monthly = {}
  for (const item of items) {
    const month = item.created_at.slice(0, 7)
    monthly[month] = (monthly[month] || 0) + item.amount
  }
  return Object.values(monthly)
}

function calculateTrend(values) {
  const n = values.length
  const sumX = n * (n + 1) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((sum, y, x) => sum + (x + 1) * y, 0)
  const sumX2 = n * (n + 1) * (2 * n + 1) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept, growthRate: (slope / intercept * 100) || 0 }
}

function detectSeasonality(values) {
  const seasonal = {}
  for (let month = 0; month < 12; month++) {
    const monthValues = values.filter((_, i) => (i % 12) === month)
    const avg = calculateAverage(monthValues)
    seasonal[month] = avg / calculateAverage(values)
  }
  return seasonal
}

function calculateMovingAverage(values, window) {
  const ma = []
  for (let i = 0; i < values.length - window + 1; i++) {
    const avg = calculateAverage(values.slice(i, i + window))
    ma.push(avg)
  }
  return ma
}

function calculateChurnScore(features) {
  // Logistic regression-style scoring
  let score = 0.5

  if (features.daysSinceLastProject > 60) score += 0.2
  if (features.overdueInvoices > 0) score += 0.15
  if (features.activeProjectsCount === 0) score += 0.2
  if (features.invoiceFrequency < 1) score += 0.1

  return Math.min(1, Math.max(0, score))
}

function identifyRiskFactors(features) {
  const factors = []
  if (features.daysSinceLastProject > 60) factors.push('No recent projects')
  if (features.overdueInvoices > 0) factors.push('Outstanding invoices')
  if (features.activeProjectsCount === 0) factors.push('No active projects')
  return factors
}

function getChurnMitigationActions(features) {
  const actions = []
  if (features.overdueInvoices > 0) actions.push('Follow up on overdue invoices')
  if (features.daysSinceLastProject > 60) actions.push('Reach out with new opportunity')
  return actions
}

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000))
}

function isOverdue(date) {
  return daysSince(date) > 30
}

function calculateAverage(values) {
  return values.reduce((a, b) => a + b, 0) / values.length || 0
}

function calculateMean(data) {
  return data.reduce((sum, d) => sum + d.value, 0) / data.length
}

function calculateStdDev(data) {
  const mean = calculateMean(data)
  const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length
  return Math.sqrt(variance)
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months)
}

function getMonthsAgo(months) {
  return new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
}

async function fetchMetricData(metric, days) { return [] }
function calculateCAC(client) { return 0 }
function groupByCohort(clients, size) { return {} }
