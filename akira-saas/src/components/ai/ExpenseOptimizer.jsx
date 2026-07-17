import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingDown, Zap, Cpu, Layers, Check, AlertCircle,
} from 'lucide-react'

const mockOptimizations = [
  {
    id: 1,
    category: 'Infrastructure',
    title: 'Consolidate underutilized servers',
    description: 'Move low-traffic services to shared infrastructure',
    currentCost: 2400,
    optimizedCost: 1200,
    savings: 1200,
    savingsPercent: 50,
    impact: 'High',
    effort: 'Medium',
    timeline: '2 weeks',
    priority: 'high',
    status: 'Recommended',
  },
  {
    id: 2,
    category: 'Software Licenses',
    title: 'Renegotiate SaaS contracts',
    description: 'Consolidate vendors and negotiate volume discounts',
    currentCost: 3500,
    optimizedCost: 2800,
    savings: 700,
    savingsPercent: 20,
    impact: 'Medium',
    effort: 'Low',
    timeline: '1 week',
    priority: 'high',
    status: 'Recommended',
  },
  {
    id: 3,
    category: 'Personnel',
    title: 'Automate repetitive tasks',
    description: 'Use RPA for data entry and report generation',
    currentCost: 5600,
    optimizedCost: 4200,
    savings: 1400,
    savingsPercent: 25,
    impact: 'High',
    effort: 'High',
    timeline: '4 weeks',
    priority: 'medium',
    status: 'In Progress',
  },
  {
    id: 4,
    category: 'Operations',
    title: 'Optimize cloud storage',
    description: 'Archive old data and enable compression',
    currentCost: 1200,
    optimizedCost: 600,
    savings: 600,
    savingsPercent: 50,
    impact: 'Low',
    effort: 'Low',
    timeline: '3 days',
    priority: 'low',
    status: 'Recommended',
  },
]

function PriorityBadge({ priority }) {
  const colors = {
    high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
  }
  const color = colors[priority] || colors.low
  return (
    <div
      className="px-2 py-1 rounded-md text-xs font-semibold"
      style={{ background: color.bg, color: color.text }}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </div>
  )
}

export default function ExpenseOptimizer() {
  const [selectedOptimization, setSelectedOptimization] = useState(null)
  const [filter, setFilter] = useState('all')

  const totalCurrentCost = mockOptimizations.reduce((sum, o) => sum + o.currentCost, 0)
  const totalOptimizedCost = mockOptimizations.reduce((sum, o) => sum + o.optimizedCost, 0)
  const totalPotentialSavings = totalCurrentCost - totalOptimizedCost
  const savingsPercent = Math.round((totalPotentialSavings / totalCurrentCost) * 100)

  const recommendedCount = mockOptimizations.filter(o => o.priority === 'high').length
  const annualSavings = totalPotentialSavings * 12

  const filteredData = mockOptimizations.filter(opt => {
    if (filter === 'recommended') return opt.priority === 'high'
    if (filter === 'inprogress') return opt.status === 'In Progress'
    if (filter === 'quick-wins') return opt.effort === 'Low' && opt.savings > 500
    return true
  })

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
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-red-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Current Monthly</p>
          <p className="text-2xl font-black text-text-1 mb-1">${(totalCurrentCost / 1000).toFixed(1)}k</p>
          <p className="text-text-4 text-xs">Total expenses</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Potential Savings</p>
          <p className="text-2xl font-black text-green-500 mb-1">${(totalPotentialSavings / 1000).toFixed(1)}k</p>
          <p className="text-text-4 text-xs">{savingsPercent}% reduction</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Annual Impact</p>
          <p className="text-2xl font-black text-green-500 mb-1">${(annualSavings / 1000).toFixed(0)}k</p>
          <p className="text-text-4 text-xs">Yearly savings</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Recommended</p>
          <p className="text-2xl font-black text-brand-500 mb-1">{recommendedCount}</p>
          <p className="text-text-4 text-xs">Opportunities</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All' },
          { value: 'recommended', label: 'High Priority' },
          { value: 'quick-wins', label: 'Quick Wins' },
          { value: 'inprogress', label: 'In Progress' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.value
                ? 'bg-brand-500 text-white'
                : 'bg-surface-2 text-text-2 hover:bg-surface-3'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Optimizations List */}
      <div className="space-y-3">
        {filteredData.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedOptimization(opt)}
            className="p-4 rounded-lg bg-surface-2 border border-border cursor-pointer hover:border-brand-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-text-1 font-semibold">{opt.title}</p>
                  {opt.status === 'In Progress' && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-text-4 text-xs mb-2">{opt.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-md bg-surface-3 text-text-3 text-xs">
                    {opt.category}
                  </span>
                  <PriorityBadge priority={opt.priority} />
                  <span className="px-2 py-1 rounded-md bg-surface-3 text-text-3 text-xs">
                    {opt.effort} effort
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-green-500 font-bold text-lg">${(opt.savings / 1000).toFixed(1)}k</p>
                <p className="text-text-4 text-xs">{opt.savingsPercent}% savings</p>
              </div>
            </div>

            {/* Cost comparison */}
            <div className="mt-3 p-3 rounded-lg bg-surface-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-3">Current: ${(opt.currentCost / 1000).toFixed(1)}k</span>
                <span className="text-green-500 font-semibold">→ ${(opt.optimizedCost / 1000).toFixed(1)}k</span>
              </div>
              <div className="w-full bg-surface-4 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(opt.optimizedCost / opt.currentCost) * 100}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="h-full rounded-full bg-green-500"
                />
              </div>
            </div>

            {/* Timeline and effort */}
            <div className="mt-2 flex items-center justify-between text-xs text-text-4">
              <span>{opt.timeline}</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {opt.impact} impact
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Implementation Guide */}
      <motion.div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-300 font-semibold text-sm mb-2">Quick Implementation Steps</p>
            <ol className="text-purple-200/80 text-xs space-y-1">
              <li>1. Start with low-effort, high-impact items (Quick Wins)</li>
              <li>2. Build business case for medium/high-effort optimizations</li>
              <li>3. Allocate resources and set implementation timeline</li>
              <li>4. Monitor savings post-implementation</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
