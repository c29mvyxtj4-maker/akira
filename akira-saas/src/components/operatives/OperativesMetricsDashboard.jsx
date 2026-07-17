import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'

/**
 * Operatives Metrics Dashboard
 * Real-time monitoring of operative performance
 */
export default function OperativesMetricsDashboard({ metrics = {} }) {
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics)

  useEffect(() => {
    setAnimatedMetrics(metrics)
  }, [metrics])

  const defaultMetrics = {
    totalExecutions: 0,
    successRate: 0,
    avgDuration: 0,
    activeOperatives: 0,
    failureRate: 0,
    lastExecution: null,
    ...metrics,
  }

  const stats = [
    {
      label: 'Total Executions',
      value: defaultMetrics.totalExecutions,
      icon: Zap,
      color: '#8b5cf6',
      change: '+12%',
    },
    {
      label: 'Success Rate',
      value: `${defaultMetrics.successRate}%`,
      icon: CheckCircle,
      color: '#22c55e',
      change: '+5%',
    },
    {
      label: 'Avg Duration',
      value: `${defaultMetrics.avgDuration}ms`,
      icon: Clock,
      color: '#3b82f6',
      change: '-15%',
    },
    {
      label: 'Failure Rate',
      value: `${defaultMetrics.failureRate}%`,
      icon: AlertCircle,
      color: '#ef4444',
      change: '-3%',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: 0 }}>
                  {stat.label}
                </p>
                <Icon style={{ width: '18px', height: '18px', color: stat.color }} />
              </div>

              {/* Value */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: 'var(--text-1)',
                  margin: 0,
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  {stat.value}
                </p>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: stat.change.startsWith('+') ? '#22c55e' : '#3b82f6',
                }}>
                  {stat.change}
                </span>
              </div>

              {/* Trend */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text-5)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
              }}>
                <TrendingUp style={{ width: '12px', height: '12px' }} />
                <span>Trending {stat.change.startsWith('+') ? 'up' : 'down'}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Last Execution Info */}
      {defaultMetrics.lastExecution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
            border: '1px solid rgba(34,197,94,0.2)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: '0 0 4px 0' }}>
              Last Execution
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
              {defaultMetrics.lastExecution.operative} ✅ Success
            </p>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: 0 }}>
            {new Date(defaultMetrics.lastExecution.timestamp).toLocaleTimeString()}
          </p>
        </motion.div>
      )}
    </div>
  )
}
