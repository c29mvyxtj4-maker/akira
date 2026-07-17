/**
 * Billing & Subscription Service
 *
 * Stripe integration for payment processing
 * Subscription management, invoicing, usage tracking
 */

import { supabase } from '@/lib/supabase'

// ========================================
// PRICING PLANS
// ========================================

export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: {
      users: 1,
      projects: 5,
      storage_gb: 10,
      api_calls_per_month: 10000,
      time_entries_per_month: 100,
      operatives: false,
    }
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    features: {
      users: 5,
      projects: 50,
      storage_gb: 100,
      api_calls_per_month: 100000,
      time_entries_per_month: 5000,
      operatives: 'basic', // 5 operatives
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: {
      users: 50,
      projects: 500,
      storage_gb: 1000,
      api_calls_per_month: 1000000,
      time_entries_per_month: 50000,
      operatives: 'unlimited',
    }
  }
}

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

/**
 * Create subscription for user
 */
export async function createSubscription(planId, paymentMethodId) {
  const { userId } = await supabase.auth.getUser()

  // Create Stripe customer if not exists
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  let stripeCustomerId = customer?.stripe_customer_id

  if (!stripeCustomerId) {
    // Create new Stripe customer
    const stripeCustomer = await createStripeCustomer(userId)
    stripeCustomerId = stripeCustomer.id

    // Store mapping
    await supabase
      .from('stripe_customers')
      .insert([{
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
      }])
  }

  // Create subscription in Stripe
  const stripeSubscription = await createStripeSubscription(
    stripeCustomerId,
    planId,
    paymentMethodId
  )

  // Store subscription in DB
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: stripeSubscription.id,
      status: 'active',
      current_period_start: new Date(stripeSubscription.current_period_start * 1000),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  return subscription
}

/**
 * Get user's current subscription
 */
export async function getCurrentSubscription() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}

/**
 * Upgrade subscription plan
 */
export async function upgradeSubscription(newPlanId) {
  const subscription = await getCurrentSubscription()
  if (!subscription) throw new Error('No active subscription')

  // Update Stripe subscription
  await updateStripeSubscription(subscription.stripe_subscription_id, newPlanId)

  // Update DB
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan_id: newPlanId, updated_at: new Date().toISOString() })
    .eq('id', subscription.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel subscription
 */
export async function cancelSubscription() {
  const subscription = await getCurrentSubscription()
  if (!subscription) throw new Error('No active subscription')

  // Cancel in Stripe
  await cancelStripeSubscription(subscription.stripe_subscription_id)

  // Update DB
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  return { success: true }
}

// ========================================
// USAGE TRACKING
// ========================================

/**
 * Track API usage for billing
 */
export async function trackUsage(metric, amount = 1) {
  const { userId } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('amount')
    .eq('user_id', userId)
    .eq('metric', metric)
    .eq('date', today)
    .single()

  if (existing) {
    // Update existing
    await supabase
      .from('usage_tracking')
      .update({ amount: existing.amount + amount })
      .eq('user_id', userId)
      .eq('metric', metric)
      .eq('date', today)
  } else {
    // Insert new
    await supabase
      .from('usage_tracking')
      .insert([{
        user_id: userId,
        metric,
        amount,
        date: today,
      }])
  }
}

/**
 * Get current month usage
 */
export async function getCurrentUsage() {
  const { userId } = await supabase.auth.getUser()
  const monthStart = new Date()
  monthStart.setDate(1)

  const { data } = await supabase
    .from('usage_tracking')
    .select('metric, amount')
    .eq('user_id', userId)
    .gte('date', monthStart.toISOString().split('T')[0])

  if (!data) return {}

  const usage = {}
  data.forEach(row => {
    usage[row.metric] = (usage[row.metric] || 0) + row.amount
  })

  return usage
}

/**
 * Check if usage within plan limits
 */
export async function checkUsageLimits(metric) {
  const subscription = await getCurrentSubscription()
  if (!subscription) throw new Error('No active subscription')

  const plan = PLANS[subscription.plan_id.toUpperCase()]
  if (!plan) throw new Error('Invalid plan')

  const usage = await getCurrentUsage()
  const limit = plan.features[metric]

  if (!limit || limit === 'unlimited') return { allowed: true }

  const currentUsage = usage[metric] || 0
  return {
    allowed: currentUsage < limit,
    current: currentUsage,
    limit,
    remaining: Math.max(0, limit - currentUsage)
  }
}

// ========================================
// INVOICING
// ========================================

/**
 * Get billing history
 */
export async function getBillingHistory(limit = 12) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('billing_invoices')
    .select('*')
    .eq('user_id', userId)
    .order('invoice_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Download invoice
 */
export async function downloadInvoice(invoiceId) {
  // Generate PDF from invoice data
  // In production, use Stripe's invoice PDF URL
  return `https://invoices.stripe.com/i/${invoiceId}`
}

/**
 * Get billing overview
 */
export async function getBillingOverview() {
  const subscription = await getCurrentSubscription()
  const invoices = await getBillingHistory(1)
  const usage = await getCurrentUsage()

  return {
    currentPlan: subscription ? PLANS[subscription.plan_id.toUpperCase()] : null,
    nextBillingDate: subscription?.current_period_end || null,
    totalSpend: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    currentUsage: usage,
  }
}

// ========================================
// STRIPE INTEGRATION (Stub - implement with Stripe SDK)
// ========================================

async function createStripeCustomer(userId) {
  // TODO: Implement with Stripe SDK
  return { id: `stripe_${userId}` }
}

async function createStripeSubscription(customerId, planId, paymentMethodId) {
  // TODO: Implement with Stripe SDK
  return {
    id: `sub_${Date.now()}`,
    current_period_start: Date.now() / 1000,
    current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
  }
}

async function updateStripeSubscription(subscriptionId, newPlanId) {
  // TODO: Implement with Stripe SDK
  return true
}

async function cancelStripeSubscription(subscriptionId) {
  // TODO: Implement with Stripe SDK
  return true
}

// ========================================
// WEBHOOK HANDLERS (for Stripe events)
// ========================================

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentSuccess(event.data.object)
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object)
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object)
    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object)
    default:
      return null
  }
}

async function handlePaymentSuccess(paymentIntent) {
  // Update subscription status
  console.log('Payment successful:', paymentIntent.id)
}

async function handleSubscriptionUpdated(subscription) {
  // Update DB with new subscription details
  console.log('Subscription updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription) {
  // Mark subscription as cancelled
  console.log('Subscription deleted:', subscription.id)
}

async function handlePaymentFailed(invoice) {
  // Send email to user about failed payment
  console.log('Payment failed:', invoice.id)
}
