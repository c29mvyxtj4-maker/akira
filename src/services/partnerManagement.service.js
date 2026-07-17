/**
 * Partner Management Service (Phase 8)
 *
 * Partner onboarding, revenue sharing, enablement resources
 * Partner portal, metrics tracking, payout management
 */

import { supabase } from '@/lib/supabase'

// ========================================
// PARTNER ONBOARDING
// ========================================

/**
 * Create partner account
 */
export async function createPartner(partnerData) {
  const { data, error } = await supabase
    .from('partners')
    .insert([{
      company_name: partnerData.companyName,
      contact_email: partnerData.contactEmail,
      contact_name: partnerData.contactName,
      partner_type: partnerData.partnerType, // reseller, integrator, technology
      website: partnerData.website,
      status: 'pending_approval',
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Send onboarding email
  await sendPartnerOnboardingEmail(data.id, partnerData.contactEmail)

  return data
}

/**
 * Approve partner
 */
export async function approvePartner(partnerId) {
  const { data, error } = await supabase
    .from('partners')
    .update({
      status: 'active',
      approved_at: new Date().toISOString(),
      api_key: generateAPIKey(),
    })
    .eq('id', partnerId)
    .select()
    .single()

  if (error) throw error

  // Send approval email with API key
  await sendPartnerApprovalEmail(data.id, data.contact_email, data.api_key)

  return data
}

/**
 * Get partner details
 */
export async function getPartner(partnerId) {
  const { data, error } = await supabase
    .from('partners')
    .select(`
      *,
      integrations (count),
      revenue_share (total_earned, total_paid),
      metrics (installations, active_customers, mau)
    `)
    .eq('id', partnerId)
    .single()

  if (error) throw error
  return data
}

// ========================================
// REVENUE SHARING MODEL
// ========================================

/**
 * Revenue sharing tiers
 */
export const REVENUE_SHARE_TIERS = {
  RESELLER: {
    tier: 'reseller',
    commission: 0.30, // 30%
    minRevenue: 0,
    description: 'Resell AKIRA to your clients',
  },
  INTEGRATOR: {
    tier: 'integrator',
    commission: 0.25, // 25%
    minRevenue: 10000,
    description: 'Build integrations and customizations',
  },
  TECHNOLOGY: {
    tier: 'technology',
    commission: 0.20, // 20%
    minRevenue: 50000,
    description: 'Technology partnership and co-marketing',
  },
  CHANNEL: {
    tier: 'channel',
    commission: 0.35, // 35%
    minRevenue: 100000,
    description: 'Exclusive channel partner',
  },
}

/**
 * Calculate revenue share for transaction
 */
export async function calculateRevenueShare(partnerId, transactionAmount) {
  const { data: partner } = await supabase
    .from('partners')
    .select('partner_type')
    .eq('id', partnerId)
    .single()

  const tier = REVENUE_SHARE_TIERS[partner.partner_type.toUpperCase()]
  const shareAmount = transactionAmount * tier.commission

  return {
    partnerId,
    transactionAmount,
    commissionRate: tier.commission,
    shareAmount,
    netAKIRA: transactionAmount - shareAmount,
  }
}

/**
 * Record revenue share transaction
 */
export async function recordRevenueShare(partnerId, customerId, amount, description) {
  const share = await calculateRevenueShare(partnerId, amount)

  const { data, error } = await supabase
    .from('revenue_shares')
    .insert([{
      partner_id: partnerId,
      customer_id: customerId,
      gross_amount: amount,
      commission_rate: share.commissionRate,
      partner_earned: share.shareAmount,
      akira_earned: share.netAKIRA,
      status: 'pending', // pending → ready_to_pay → paid
      description,
      transaction_date: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Calculate partner earnings (with batching)
 */
export async function getPartnerEarnings(partnerId, startDate, endDate) {
  const { data, error } = await supabase
    .from('revenue_shares')
    .select('partner_earned, status')
    .eq('partner_id', partnerId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (error) throw error

  const earnings = {
    pending: data.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.partner_earned, 0),
    readyToPay: data.filter(r => r.status === 'ready_to_pay').reduce((sum, r) => sum + r.partner_earned, 0),
    paid: data.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.partner_earned, 0),
    total: data.reduce((sum, r) => sum + r.partner_earned, 0),
  }

  return earnings
}

/**
 * Process partner payout
 */
export async function processPartnerPayout(partnerId, paymentMethod = 'stripe') {
  const earnings = await getPartnerEarnings(
    partnerId,
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    new Date()
  )

  if (earnings.readyToPay === 0) {
    throw new Error('No earnings ready to pay')
  }

  // Create payout
  const { data: payout, error } = await supabase
    .from('partner_payouts')
    .insert([{
      partner_id: partnerId,
      amount: earnings.readyToPay,
      payment_method: paymentMethod,
      status: 'processing',
      processed_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Update revenue shares to paid
  await supabase
    .from('revenue_shares')
    .update({ status: 'paid', payout_id: payout.id })
    .eq('partner_id', partnerId)
    .eq('status', 'ready_to_pay')

  return payout
}

// ========================================
// PARTNER ENABLEMENT
// ========================================

/**
 * Partner resource library
 */
export const ENABLEMENT_RESOURCES = {
  QUICK_START: {
    id: 'quick_start',
    title: 'Quick Start Guide',
    type: 'guide',
    url: '/docs/partners/quick-start',
    updated: '2026-07-15',
  },
  API_REFERENCE: {
    id: 'api_reference',
    title: 'API Reference',
    type: 'documentation',
    url: '/docs/api',
    updated: '2026-07-15',
  },
  INTEGRATION_EXAMPLES: {
    id: 'integration_examples',
    title: 'Integration Code Examples',
    type: 'code',
    url: '/docs/integrations/examples',
    updated: '2026-07-15',
  },
  SALES_KIT: {
    id: 'sales_kit',
    title: 'Sales & Marketing Materials',
    type: 'marketing',
    url: '/partners/sales-kit',
    updated: '2026-07-15',
  },
  VIDEO_TRAINING: {
    id: 'video_training',
    title: 'Partner Training Videos',
    type: 'video',
    url: 'https://youtube.com/akira-partners',
    updated: '2026-07-15',
  },
  CERTIFICATION: {
    id: 'certification',
    title: 'Partner Certification Program',
    type: 'course',
    url: '/partners/certification',
    updated: '2026-07-15',
  },
}

/**
 * Get partner enablement resources
 */
export async function getPartnerResources(partnerId) {
  const { data: partner } = await supabase
    .from('partners')
    .select('partner_type')
    .eq('id', partnerId)
    .single()

  // Customize resources by partner type
  const resources = Object.values(ENABLEMENT_RESOURCES)

  if (partner.partner_type === 'reseller') {
    return resources.filter(r => ['sales_kit', 'quick_start', 'video_training'].includes(r.id))
  }

  if (partner.partner_type === 'integrator') {
    return resources.filter(r => ['api_reference', 'integration_examples', 'certification'].includes(r.id))
  }

  return resources
}

/**
 * Track partner training completion
 */
export async function completeTraining(partnerId, trainingId) {
  const { data, error } = await supabase
    .from('partner_training_completion')
    .insert([{
      partner_id: partnerId,
      training_id: trainingId,
      completed_at: new Date().toISOString(),
    }])

  if (error) throw error

  // Check if eligible for certification
  const { data: completed } = await supabase
    .from('partner_training_completion')
    .select('training_id')
    .eq('partner_id', partnerId)

  if (completed.length >= 3) { // Minimum 3 trainings
    await awardCertification(partnerId)
  }

  return data
}

/**
 * Award partner certification badge
 */
async function awardCertification(partnerId) {
  await supabase
    .from('partners')
    .update({
      is_certified: true,
      certified_at: new Date().toISOString(),
    })
    .eq('id', partnerId)
}

// ========================================
// PARTNER PORTAL
// ========================================

/**
 * Get partner portal dashboard data
 */
export async function getPartnerPortalDashboard(partnerId) {
  const partner = await getPartner(partnerId)
  const earnings = await getPartnerEarnings(
    partnerId,
    new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), // Last 12 months
    new Date()
  )

  const { data: customers } = await supabase
    .from('partner_customers')
    .select('id, status')
    .eq('partner_id', partnerId)

  const { data: integrations } = await supabase
    .from('partner_integrations')
    .select('id, status')
    .eq('partner_id', partnerId)

  return {
    partner: {
      name: partner.company_name,
      type: partner.partner_type,
      status: partner.status,
      joinedDate: partner.created_at,
    },
    metrics: {
      activeCustomers: customers.filter(c => c.status === 'active').length,
      totalCustomers: customers.length,
      integrations: integrations.filter(i => i.status === 'live').length,
      earningsThisMonth: earnings.total,
      earningsPending: earnings.pending,
    },
    resources: await getPartnerResources(partnerId),
  }
}

/**
 * Get partner customer list
 */
export async function getPartnerCustomers(partnerId) {
  const { data, error } = await supabase
    .from('partner_customers')
    .select(`
      id, customer_id, status, created_at,
      customers (name, email)
    `)
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ========================================
// PARTNER METRICS & ANALYTICS
// ========================================

/**
 * Record partner metrics
 */
export async function recordPartnerMetrics(partnerId, metrics) {
  const { data, error } = await supabase
    .from('partner_metrics')
    .insert([{
      partner_id: partnerId,
      installations: metrics.installations || 0,
      active_customers: metrics.activeCustomers || 0,
      mau: metrics.mau || 0,
      integrations_built: metrics.integrationBuilt || 0,
      support_tickets: metrics.supportTickets || 0,
      nps_score: metrics.npsScore || 0,
      recorded_at: new Date().toISOString(),
    }])

  if (error) throw error
  return data
}

/**
 * Get partner performance report
 */
export async function getPartnerPerformanceReport(partnerId, months = 12) {
  const { data: metrics, error } = await supabase
    .from('partner_metrics')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('recorded_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000))
    .order('recorded_at')

  if (error) throw error

  // Calculate trends
  const firstMonth = metrics[0]
  const lastMonth = metrics[metrics.length - 1]

  return {
    installations: {
      current: lastMonth?.installations || 0,
      previous: firstMonth?.installations || 0,
      growth: calculatePercentageChange(firstMonth?.installations, lastMonth?.installations),
    },
    activeCustomers: {
      current: lastMonth?.active_customers || 0,
      previous: firstMonth?.active_customers || 0,
      growth: calculatePercentageChange(firstMonth?.active_customers, lastMonth?.active_customers),
    },
    npsScore: lastMonth?.nps_score || 0,
    metrics,
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateAPIKey() {
  return `akira_partner_${Math.random().toString(36).substr(2, 32)}`
}

function calculatePercentageChange(previous, current) {
  if (!previous) return 0
  return (((current - previous) / previous) * 100).toFixed(1)
}

async function sendPartnerOnboardingEmail(partnerId, email) {
  // Send welcome email
}

async function sendPartnerApprovalEmail(partnerId, email, apiKey) {
  // Send approval email with API key
}
