import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Check, AlertCircle, TrendingUp, Users,
  Zap, CreditCard, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { getBillingPlans, getCurrentSubscription, upgradePlan, downgradePlan } from '@/services/billing.service'
import Card from '@/components/ui/Card'

/**
 * Billing Manager
 * Manage subscription plans, pricing tiers, and billing information
 */
export default function BillingManager() {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)
  const [error, setError] = useState(null)
  const [showBillingHistory, setShowBillingHistory] = useState(false)

  useEffect(() => {
    loadBillingInfo()
  }, [])

  const loadBillingInfo = async () => {
    try {
      setLoading(true)
      const [plansData, subscriptionData] = await Promise.all([
        getBillingPlans(),
        getCurrentSubscription()
      ])
      setPlans(plansData)
      setCurrentSubscription(subscriptionData)
      setError(null)
    } catch (err) {
      console.error('Error loading billing info:', err)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (newPlanId) => {
    if (!confirm('Are you sure you want to change your subscription plan?')) return

    try {
      setUpgrading(newPlanId)
      if (newPlanId > currentSubscription.plan_id) {
        await upgradePlan(newPlanId)
      } else {
        await downgradePlan(newPlanId)
      }
      setCurrentSubscription({ ...currentSubscription, plan_id: newPlanId })
      setError(null)
    } catch (err) {
      console.error('Error changing plan:', err)
      setError('Failed to change subscription plan')
    } finally {
      setUpgrading(null)
    }
  }

  const PLANS_DESCRIPTION = {
    starter: {
      name: 'Starter',
      description: 'Perfect for small teams just getting started',
      features: [
        'Up to 50 clients',
        'Unlimited projects',
        'Basic reporting',
        'Email support',
        'API access (100 requests/day)',
      ]
    },
    professional: {
      name: 'Professional',
      description: 'For growing businesses with advanced needs',
      features: [
        'Up to 500 clients',
        'Unlimited projects',
        'Advanced reporting & analytics',
        'Priority email & chat support',
        'API access (10,000 requests/day)',
        'Custom workflows',
        'Team collaboration',
      ]
    },
    enterprise: {
      name: 'Enterprise',
      description: 'Unlimited power for large organizations',
      features: [
        'Unlimited clients',
        'Unlimited projects',
        'Custom analytics',
        '24/7 phone & dedicated support',
        'Unlimited API requests',
        'White-label options',
        'SSO & advanced security',
        'Webhook integrations',
        'Custom integrations',
      ]
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface-3 animate-spin mb-3 mx-auto" />
          <p className="text-text-4 text-sm">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Overview */}
      {currentSubscription && (
        <Card padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-text-4 text-xs font-semibold uppercase mb-2">Current Plan</p>
              <div>
                <h2 className="text-3xl font-bold text-text-1 mb-2">
                  {PLANS_DESCRIPTION[currentSubscription.plan_type]?.name || currentSubscription.plan_type}
                </h2>
                <p className="text-text-4 text-sm mb-4">
                  {PLANS_DESCRIPTION[currentSubscription.plan_type]?.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-brand-500">
                    ${currentSubscription.price}
                  </span>
                  <span className="text-text-4 text-sm">/month</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-2 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text-4 text-sm">Billing Cycle</span>
                  <span className="text-text-1 font-semibold">
                    {new Date(currentSubscription.billing_cycle_start).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-4 text-sm">Renewal Date</span>
                  <span className="text-text-1 font-semibold">
                    {new Date(currentSubscription.billing_cycle_end).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-status-success" />
                  <span className="text-sm text-status-success font-medium">
                    {currentSubscription.status === 'active' ? 'Subscription Active' : currentSubscription.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg flex gap-3">
          <AlertCircle size={16} className="text-status-danger flex-shrink-0 mt-0.5" />
          <span className="text-sm text-status-danger">{error}</span>
        </div>
      )}

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-bold text-text-1 mb-4">Upgrade or Downgrade</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const planInfo = PLANS_DESCRIPTION[plan.type.toLowerCase()]
            const isCurrent = currentSubscription?.plan_id === plan.id
            const isHigher = plan.id > (currentSubscription?.plan_id || 0)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  padding="lg"
                  className={`relative transition-all ${
                    isCurrent
                      ? 'ring-2 ring-brand-500 bg-surface-2'
                      : 'hover:border-brand-500/50'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-6 pt-2">
                    <h3 className="text-lg font-bold text-text-1 mb-1">{planInfo?.name}</h3>
                    <p className="text-xs text-text-4">{planInfo?.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-text-1">${plan.price}</span>
                      <span className="text-text-4 text-sm">/month</span>
                    </div>
                    <p className="text-xs text-text-4">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {planInfo?.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={16} className="text-status-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-2">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={isCurrent || upgrading === plan.id}
                    className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                      isCurrent
                        ? 'bg-surface-3 text-text-3 cursor-default'
                        : 'bg-brand-500 hover:bg-brand-600 text-white'
                    } ${upgrading === plan.id ? 'opacity-50' : ''}`}
                  >
                    {upgrading === plan.id
                      ? 'Processing...'
                      : isCurrent
                      ? 'Current Plan'
                      : isHigher
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Usage & Limits */}
      {currentSubscription && (
        <Card padding="lg">
          <h3 className="text-lg font-bold text-text-1 mb-4">Usage & Limits</h3>
          <div className="space-y-4">
            {/* API Calls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-brand-500" />
                  <span className="text-sm font-medium text-text-1">API Calls</span>
                </div>
                <span className="text-sm text-text-3">
                  {currentSubscription.api_calls_used || 0} / {currentSubscription.api_calls_limit}
                </span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((currentSubscription.api_calls_used || 0) / currentSubscription.api_calls_limit) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-status-info" />
                  <span className="text-sm font-medium text-text-1">Team Members</span>
                </div>
                <span className="text-sm text-text-3">
                  {currentSubscription.team_members_used || 0} / {currentSubscription.team_members_limit}
                </span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div
                  className="bg-status-info h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((currentSubscription.team_members_used || 0) / currentSubscription.team_members_limit) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-status-warning" />
                  <span className="text-sm font-medium text-text-1">Storage</span>
                </div>
                <span className="text-sm text-text-3">
                  {currentSubscription.storage_used_gb || 0} / {currentSubscription.storage_limit_gb} GB
                </span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div
                  className="bg-status-warning h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((currentSubscription.storage_used_gb || 0) / currentSubscription.storage_limit_gb) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Method */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-1">Payment Method</h3>
          <button className="text-sm text-brand-500 hover:text-brand-400 font-medium">
            Edit
          </button>
        </div>
        <div className="bg-surface-2 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={24} className="text-text-3" />
            <div>
              <p className="font-medium text-text-1">Visa ending in 4242</p>
              <p className="text-xs text-text-4">Expires 12/2025</p>
            </div>
          </div>
          <span className="text-xs text-text-4">Primary</span>
        </div>
      </Card>

      {/* Billing History */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-1">Recent Invoices</h3>
          <button
            onClick={() => setShowBillingHistory(!showBillingHistory)}
            className="text-sm text-brand-500 hover:text-brand-400 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {[
            { date: '2026-06-17', amount: 99, status: 'paid' },
            { date: '2026-05-17', amount: 99, status: 'paid' },
            { date: '2026-04-17', amount: 99, status: 'paid' },
          ].map((invoice, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  invoice.status === 'paid'
                    ? 'bg-status-success/10'
                    : 'bg-status-warning/10'
                }`}>
                  {invoice.status === 'paid' ? (
                    <Check size={16} className="text-status-success" />
                  ) : (
                    <AlertCircle size={16} className="text-status-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-1 text-sm">Invoice for {invoice.date}</p>
                  <p className="text-xs text-text-4">Monthly subscription</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-1">${invoice.amount}</p>
                <p className={`text-xs font-medium ${
                  invoice.status === 'paid'
                    ? 'text-status-success'
                    : 'text-status-warning'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
