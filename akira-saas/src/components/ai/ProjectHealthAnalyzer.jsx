import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, Target, Users, AlertTriangle,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const mockHealthData = [
  { name: 'Proj 1', health: 92, status: 'On Track', daysLeft: 5 },
  { name: 'Proj 2', health: 78, status: 'At Risk', daysLeft: 12 },
  { name: 'Proj 3', health: 65, status: 'Critical', daysLeft: 3 },
  { name: 'Proj 4', health: 88, status: 'On Track', daysLeft: 8 },
  { name: 'Proj 5', health: 72, status: 'Warning', daysLeft: 15 },
]

const mockTrendData = [
  { week: 'W1', avgHealth: 85 },
  { week: 'W2', avgHealth: 82 },
  { week: 'W3', avgHealth: 78 },
  { week: 'W4', avgHealth: 81 },
  { week: 'W5', avgHealth: 79 },
  { week: 'W6', avgHealth: 76 },
  { week: 'W7', avgHealth: 73 },
  { week: 'W8', avgHealth: 75 },
]

function HealthIndicator({ health, status }) {
  const getStatusColor = () => {
    if (health >= 85) return '#22c55e'
    if (health >= 70) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
        style={{ background: getStatusColor() }}
      >
        {health}
      </div>
      <div>
        <p className="text-text-2 text-xs font-medium">{status}</p>
        <p className="text-text-4 text-xs">Health Score</p>
      </div>
    </div>
  )
}

export default function ProjectHealthAnalyzer() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  const averageHealth = Math.round(
    mockHealthData.reduce((sum, p) => sum + p.health, 0) / mockHealthData.length
  )
  const atRiskCount = mockHealthData.filter(p => p.health < 75).length
  const onTrackCount = mockHealthData.filter(p => p.health >= 85).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-3 text-xs font-semibold uppercase tracking-wider">Average Health</p>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-3xl font-black text-text-1 mb-1">{averageHealth}%</p>
          <p className="text-text-4 text-xs">Across all projects</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-3 text-xs font-semibold uppercase tracking-wider">On Track</p>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-black text-text-1 mb-1">{onTrackCount}</p>
          <p className="text-text-4 text-xs">Projects performing well</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-red-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-3 text-xs font-semibold uppercase tracking-wider">At Risk</p>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-black text-text-1 mb-1">{atRiskCount}</p>
          <p className="text-text-4 text-xs">Need immediate attention</p>
        </motion.div>
      </div>

      {/* Health Trend Chart */}
      <motion.div
        whileHover={{ borderColor: 'rgba(230, 57, 70, 0.2)' }}
        className="p-6 rounded-xl bg-surface-2 border border-border transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-bold">Health Trend</h3>
          <p className="text-text-4 text-xs">Last 8 weeks</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              cursor={{ stroke: 'rgba(230,57,70,0.2)' }}
            />
            <Line
              type="monotone"
              dataKey="avgHealth"
              stroke="#e63946"
              strokeWidth={3}
              dot={{ r: 4, fill: '#e63946' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Projects List */}
      <motion.div className="space-y-3">
        <h3 className="text-text-1 font-bold">Projects</h3>
        {mockHealthData.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedProject(project)}
            className="p-4 rounded-lg bg-surface-2 border border-border cursor-pointer hover:border-brand-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-text-1 font-semibold mb-1">{project.name}</p>
                <div className="flex items-center gap-4 text-xs text-text-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.daysLeft} days left
                  </span>
                </div>
              </div>
              <HealthIndicator health={project.health} status={project.status} />
            </div>
            {/* Health bar */}
            <div className="mt-3 w-full bg-surface-3 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.health}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{
                  background:
                    project.health >= 85
                      ? '#22c55e'
                      : project.health >= 70
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Insights Section */}
      <motion.div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm mb-1">Key Insights</p>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              Health scores trending downward. {atRiskCount} projects need intervention. Recommend scheduling risk mitigation calls.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
