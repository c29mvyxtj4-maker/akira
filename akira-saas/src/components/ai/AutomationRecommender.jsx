import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, Clock, Users, CheckCircle, PlayCircle, BarChart3,
} from 'lucide-react'

const mockAutomations = [
  {
    id: 1,
    name: 'Invoice Follow-up Automation',
    description: 'Auto-send reminder emails for overdue invoices',
    workflow: 'Overdue Invoice → Email Reminder → 7-day follow-up',
    timeToImplement: '2 hours',
    hoursPerWeekSaved: 3,
    accuracy: 98,
    useCases: ['Send reminders', 'Track responses', 'Escalate if needed'],
    impact: 'High',
    difficulty: 'Low',
    status: 'Ready to Deploy',
    order: 1,
  },
  {
    id: 2,
    name: 'Lead Qualification Pipeline',
    description: 'Automatically score and segment leads',
    workflow: 'New Lead → Score Based on Engagement → Auto-assign to Sales',
    timeToImplement: '4 hours',
    hoursPerWeekSaved: 5,
    accuracy: 92,
    useCases: ['Lead scoring', 'Auto-routing', 'Sales prioritization'],
    impact: 'High',
    difficulty: 'Medium',
    status: 'Ready to Deploy',
    order: 2,
  },
  {
    id: 3,
    name: 'Project Status Reporting',
    description: 'Generate automated status reports from project data',
    workflow: 'Weekly Tasks → Compile Metrics → Send Reports → Archive',
    timeToImplement: '3 hours',
    hoursPerWeekSaved: 2,
    accuracy: 95,
    useCases: ['Weekly reports', 'Stakeholder updates', 'KPI tracking'],
    impact: 'Medium',
    difficulty: 'Low',
    status: 'Ready to Deploy',
    order: 3,
  },
  {
    id: 4,
    name: 'Expense Categorization',
    description: 'Auto-categorize expenses using AI',
    workflow: 'New Expense → AI Categorization → Team Approval → Post',
    timeToImplement: '2 hours',
    hoursPerWeekSaved: 1.5,
    accuracy: 89,
    useCases: ['Category assignment', 'Error reduction', 'Compliance'],
    impact: 'Medium',
    difficulty: 'Low',
    status: 'Configurable',
    order: 4,
  },
  {
    id: 5,
    name: 'Customer Onboarding Flow',
    description: 'Automated new client welcome and setup sequence',
    workflow: 'New Client → Welcome Email → Setup Checklist → Training Link',
    timeToImplement: '6 hours',
    hoursPerWeekSaved: 4,
    accuracy: 100,
    useCases: ['Onboarding', 'Documentation', 'Training delivery'],
    impact: 'High',
    difficulty: 'High',
    status: 'Blueprint Available',
    order: 5,
  },
]

function StatusBadge({ status }) {
  const colors = {
    'Ready to Deploy': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
    'Configurable': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    'Blueprint Available': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
  }
  const color = colors[status] || colors.Configurable
  return (
    <div
      className="px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1"
      style={{ background: color.bg, color: color.text }}
    >
      <PlayCircle className="w-3 h-3" />
      {status}
    </div>
  )
}

export default function AutomationRecommender() {
  const [selectedAutomation, setSelectedAutomation] = useState(null)
  const [filter, setFilter] = useState('all')

  const totalHoursSaved = mockAutomations.reduce((sum, a) => sum + a.hoursPerWeekSaved, 0)
  const yearlyHoursSaved = totalHoursSaved * 52
  const readyToDeployCount = mockAutomations.filter(a => a.status === 'Ready to Deploy').length
  const avgAccuracy = Math.round(
    mockAutomations.reduce((sum, a) => sum + a.accuracy, 0) / mockAutomations.length
  )

  const filteredData = mockAutomations.filter(auto => {
    if (filter === 'ready') return auto.status === 'Ready to Deploy'
    if (filter === 'high-impact') return auto.impact === 'High'
    if (filter === 'quick-setup') return auto.difficulty === 'Low'
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
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Hours/Week Saved</p>
          <p className="text-3xl font-black text-green-500 mb-1">{totalHoursSaved}</p>
          <p className="text-text-4 text-xs">{yearlyHoursSaved} hours/year</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Ready to Deploy</p>
          <p className="text-3xl font-black text-brand-500 mb-1">{readyToDeployCount}</p>
          <p className="text-text-4 text-xs">Automations</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-purple-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Avg Accuracy</p>
          <p className="text-3xl font-black text-purple-500 mb-1">{avgAccuracy}%</p>
          <p className="text-text-4 text-xs">AI processing</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-blue-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Total Workflows</p>
          <p className="text-3xl font-black text-blue-500 mb-1">{mockAutomations.length}</p>
          <p className="text-text-4 text-xs">Available</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Automations' },
          { value: 'ready', label: 'Ready to Deploy' },
          { value: 'high-impact', label: 'High Impact' },
          { value: 'quick-setup', label: 'Quick Setup' },
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

      {/* Automations List */}
      <div className="space-y-3">
        {filteredData
          .sort((a, b) => a.order - b.order)
          .map((auto, idx) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedAutomation(auto)}
              className="p-4 rounded-lg bg-surface-2 border border-border cursor-pointer hover:border-brand-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-text-1 font-semibold mb-1">{auto.name}</p>
                  <p className="text-text-4 text-xs mb-2">{auto.description}</p>
                  <p className="text-text-3 text-xs font-mono mb-2 p-2 rounded bg-surface-3">
                    {auto.workflow}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={auto.status} />
                    <span
                      className="px-2 py-1 rounded-md text-xs font-semibold"
                      style={{
                        background:
                          auto.impact === 'High'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        color:
                          auto.impact === 'High' ? '#22c55e' : '#f59e0b',
                      }}
                    >
                      {auto.impact} impact
                    </span>
                    <span
                      className="px-2 py-1 rounded-md text-xs font-semibold"
                      style={{
                        background:
                          auto.difficulty === 'Low'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : auto.difficulty === 'Medium'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          auto.difficulty === 'Low'
                            ? '#22c55e'
                            : auto.difficulty === 'Medium'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      {auto.difficulty} difficulty
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-500 font-bold text-lg">{auto.hoursPerWeekSaved}h</p>
                  <p className="text-text-4 text-xs">/week saved</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="p-2 rounded-lg bg-surface-3">
                  <p className="text-text-4 text-xs mb-1">Implementation</p>
                  <p className="text-text-2 font-semibold text-sm">{auto.timeToImplement}</p>
                </div>
                <div className="p-2 rounded-lg bg-surface-3">
                  <p className="text-text-4 text-xs mb-1">Accuracy</p>
                  <p className="text-text-2 font-semibold text-sm">{auto.accuracy}%</p>
                </div>
                <div className="p-2 rounded-lg bg-surface-3">
                  <p className="text-text-4 text-xs mb-1">Use Cases</p>
                  <p className="text-text-2 font-semibold text-sm">{auto.useCases.length}</p>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* ROI Calculation */}
      <motion.div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
        <div className="space-y-2">
          <p className="text-green-300 font-semibold text-sm">Estimated Annual ROI</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-text-4 text-xs mb-1">Implementation Cost</p>
              <p className="text-green-400 font-bold">~${(readyToDeployCount * 500)}</p>
            </div>
            <div>
              <p className="text-text-4 text-xs mb-1">Annual Savings</p>
              <p className="text-green-400 font-bold">~${(yearlyHoursSaved * 50)}</p>
            </div>
            <div>
              <p className="text-text-4 text-xs mb-1">ROI Timeline</p>
              <p className="text-green-400 font-bold">
                {Math.round(
                  (readyToDeployCount * 500) / (yearlyHoursSaved * 50 / 12)
                )}
                {' '}
                months
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
