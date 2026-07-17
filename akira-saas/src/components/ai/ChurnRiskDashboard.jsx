import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserX, TrendingDown, AlertTriangle, Target, Mail, Phone, Clock,
} from 'lucide-react'

const mockChurnData = [
  {
    id: 1,
    name: 'Acme Corp',
    risk: 92,
    riskLevel: 'Critical',
    reason: 'No activity for 45 days',
    lastContact: '2026-06-02',
    ltv: 15000,
    monthlyValue: 2500,
    indicators: ['Low engagement', 'Overdue invoice', 'Support tickets down'],
  },
  {
    id: 2,
    name: 'TechStart Inc',
    risk: 78,
    riskLevel: 'High',
    reason: 'Reduced project activity',
    lastContact: '2026-06-20',
    ltv: 8500,
    monthlyValue: 1200,
    indicators: ['Reduced usage', 'Sentiment change'],
  },
  {
    id: 3,
    name: 'Global Solutions',
    risk: 65,
    riskLevel: 'Medium',
    reason: 'Feature requests declined',
    lastContact: '2026-07-01',
    ltv: 12000,
    monthlyValue: 1800,
    indicators: ['Feature interest down', 'Support tickets stable'],
  },
  {
    id: 4,
    name: 'DataFlow Co',
    risk: 52,
    riskLevel: 'Low-Medium',
    reason: 'Typical seasonal pattern',
    lastContact: '2026-07-10',
    ltv: 9000,
    monthlyValue: 1500,
    indicators: ['Seasonal decline', 'Communication ongoing'],
  },
]

function RiskBadge({ risk, level }) {
  const getColors = () => {
    if (risk >= 80) return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Critical' }
    if (risk >= 60) return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'High' }
    return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', label: 'Medium' }
  }
  const colors = getColors()
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center"
        style={{ background: colors.bg, color: colors.text }}
      >
        {risk}%
      </div>
      <div>
        <p className="text-text-2 text-xs font-semibold">{level}</p>
        <p className="text-text-4 text-xs">Risk Score</p>
      </div>
    </div>
  )
}

export default function ChurnRiskDashboard() {
  const [selectedClient, setSelectedClient] = useState(null)
  const [filter, setFilter] = useState('all')

  const criticalCount = mockChurnData.filter(c => c.risk >= 80).length
  const highCount = mockChurnData.filter(c => c.risk >= 60 && c.risk < 80).length
  const avgRisk = Math.round(mockChurnData.reduce((sum, c) => sum + c.risk, 0) / mockChurnData.length)
  const totalAtRisk = mockChurnData.reduce((sum, c) => sum + c.monthlyValue, 0)

  const filteredData = mockChurnData.filter(client => {
    if (filter === 'critical') return client.risk >= 80
    if (filter === 'high') return client.risk >= 60 && client.risk < 80
    if (filter === 'medium') return client.risk < 60
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-red-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Critical Risk</p>
          <p className="text-3xl font-black text-red-500 mb-1">{criticalCount}</p>
          <p className="text-text-4 text-xs">Clients</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-amber-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">High Risk</p>
          <p className="text-3xl font-black text-amber-500 mb-1">{highCount}</p>
          <p className="text-text-4 text-xs">Clients</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Avg Risk Score</p>
          <p className="text-3xl font-black text-brand-500 mb-1">{avgRisk}%</p>
          <p className="text-text-4 text-xs">Portfolio health</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-purple-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">At Risk MRR</p>
          <p className="text-3xl font-black text-purple-500 mb-1">${(totalAtRisk / 1000).toFixed(1)}k</p>
          <p className="text-text-4 text-xs">Monthly revenue</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'critical', 'high', 'medium'].map(filterOpt => (
          <button
            key={filterOpt}
            onClick={() => setFilter(filterOpt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === filterOpt
                ? 'bg-brand-500 text-white'
                : 'bg-surface-2 text-text-2 hover:bg-surface-3'
            }`}
          >
            {filterOpt.charAt(0).toUpperCase() + filterOpt.slice(1)}
          </button>
        ))}
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {filteredData.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedClient(client)}
            className="p-4 rounded-lg bg-surface-2 border border-border cursor-pointer hover:border-brand-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <p className="text-text-1 font-semibold mb-1">{client.name}</p>
                <p className="text-text-4 text-xs mb-2">{client.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {client.indicators.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-surface-3 text-text-3 text-xs"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
              <RiskBadge risk={client.risk} level={client.riskLevel} />
            </div>

            {/* Risk bar */}
            <div className="mb-3 w-full bg-surface-3 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${client.risk}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{
                  background:
                    client.risk >= 80
                      ? '#ef4444'
                      : client.risk >= 60
                      ? '#f59e0b'
                      : '#22c55e',
                }}
              />
            </div>

            {/* Client metrics */}
            <div className="flex items-center justify-between text-xs text-text-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last contact: {new Date(client.lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                LTV: ${(client.ltv / 1000).toFixed(1)}k
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommended Actions */}
      <motion.div className="space-y-3">
        <h3 className="text-text-1 font-bold">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredData.slice(0, 2).map((client, idx) => (
            <motion.div
              key={idx}
              className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
            >
              <p className="text-blue-300 font-semibold text-sm mb-2">For {client.name}</p>
              <ul className="space-y-1 text-blue-200/80 text-xs">
                <li className="flex items-start gap-2">
                  <Mail className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Send personalized outreach email
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Schedule check-in call
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Offer feature demo or upgrade
                </li>
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
