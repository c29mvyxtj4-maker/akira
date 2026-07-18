import { motion } from 'framer-motion'
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'

const mockInsights = [
  {
    id: 1,
    type: 'positive',
    title: 'Revenue Growth Acceleration',
    description: 'MRR increased by 12% this month, highest growth in 6 months. Driven by new enterprise customers.',
    metric: '+12% MRR',
    actionable: true,
    recommendation: 'Scale sales team to capitalize on momentum',
    priority: 'high',
    timestamp: '2 hours ago',
    icon: TrendingUp,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Churn Rate Rising',
    description: '3 enterprise customers at high risk of churning. Shared common complaint about feature gaps.',
    metric: '15% risk',
    actionable: true,
    recommendation: 'Schedule QBRs with at-risk accounts this week',
    priority: 'high',
    timestamp: '4 hours ago',
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: 'positive',
    title: 'Customer Acquisition Optimized',
    description: 'CAC reduced by 18% through improved referral program and targeted marketing.',
    metric: '-18% CAC',
    actionable: false,
    recommendation: 'Continue current strategy',
    priority: 'medium',
    timestamp: '1 day ago',
    icon: CheckCircle,
  },
  {
    id: 4,
    type: 'neutral',
    title: 'Seasonality Pattern Detected',
    description: 'Q3 typically shows 8-12% decline in usage. Recommend planning seasonal campaigns now.',
    metric: 'Cyclical trend',
    actionable: true,
    recommendation: 'Launch retention campaign for Q3',
    priority: 'medium',
    timestamp: '2 days ago',
    icon: Zap,
  },
  {
    id: 5,
    type: 'positive',
    title: 'Product Engagement Up',
    description: 'New feature adoption rate is 67% within first week. Exceeded target of 50%.',
    metric: '+67% adoption',
    actionable: false,
    recommendation: 'Market success to other segments',
    priority: 'low',
    timestamp: '3 days ago',
    icon: TrendingUp,
  },
]

function InsightCard({ insight, idx }) {
  const [dismissed, setDismissed] = useState(false)
  const Icon = insight.icon

  const getTypeColor = () => {
    if (insight.type === 'positive') {
      return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' }
    }
    if (insight.type === 'warning') {
      return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' }
    }
    return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' }
  }

  const colors = getTypeColor()

  if (dismissed) return null

  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: idx * 0.05 }}
      className="p-4 rounded-lg border transition-all"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${colors.text}20` }}>
            <Icon className="w-5 h-5" style={{ color: colors.text }} />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-text-1 font-semibold">{insight.title}</h4>
              <p className="text-text-4 text-xs">{insight.timestamp}</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-text-4 hover:text-text-2 transition-colors text-lg font-light"
            >
              ×
            </button>
          </div>

          <p className="text-text-2 text-sm mb-3">{insight.description}</p>

          {insight.actionable && (
            <div className="mb-3 p-3 rounded-lg bg-surface-2 border border-border">
              <p className="text-text-3 text-xs font-semibold mb-1 uppercase">Recommended Action</p>
              <p className="text-text-2 text-sm">{insight.recommendation}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm font-bold" style={{ color: colors.text }}>
              {insight.metric}
            </div>
            {insight.actionable && (
              <button className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors">
                Learn more <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function InsightsFeed() {
  const positiveCount = mockInsights.filter(i => i.type === 'positive').length
  const warningCount = mockInsights.filter(i => i.type === 'warning').length
  const actionableCount = mockInsights.filter(i => i.actionable).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Total Insights</p>
          <p className="text-3xl font-black text-text-1">{mockInsights.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Positive Trends</p>
          <p className="text-3xl font-black text-green-500">{positiveCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-red-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Warnings</p>
          <p className="text-3xl font-black text-red-500">{warningCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-amber-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Actionable</p>
          <p className="text-3xl font-black text-amber-500">{actionableCount}</p>
        </motion.div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        <h3 className="text-text-1 font-bold">Recent Insights</h3>
        {mockInsights.map((insight, idx) => (
          <InsightCard key={insight.id} insight={insight} idx={idx} />
        ))}
      </div>

      {/* AI Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-brand-500/10 border border-brand-500/30"
      >
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-brand-300 font-semibold text-sm mb-1">AI-Generated Insights</p>
            <p className="text-brand-200/80 text-xs">
              These insights are generated by our AI analysis engine using your business data. Review and validate before taking action.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
