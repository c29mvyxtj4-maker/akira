import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Zap, AlertCircle } from 'lucide-react'
import PageHeader from '@/shared/components/layout/PageHeader'

/**
 * Admin Dashboard
 * Platform-wide metrics and analytics
 */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    totalApiCalls: 0,
    averageResponseTime: 0,
    systemUptime: 0,
    errorRate: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load admin metrics
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(false)
    // TODO: Load actual metrics from analytics service
  }

  const stats = [
    {
      label: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      color: '#3b82f6',
      change: '+12%'
    },
    {
      label: 'Active Subscriptions',
      value: metrics.activeSubscriptions,
      icon: DollarSign,
      color: '#22c55e',
      change: '+8%'
    },
    {
      label: 'Monthly Revenue',
      value: `$${(metrics.monthlyRecurringRevenue / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      color: '#f59e0b',
      change: '+15%'
    },
    {
      label: 'API Calls/Day',
      value: (metrics.totalApiCalls / 1000).toFixed(0) + 'k',
      icon: Zap,
      color: '#8b5cf6',
      change: '+25%'
    },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide metrics and analytics"
      />

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
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
              }}
              whileHover={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: 0 }}>
                  {stat.label}
                </p>
                <Icon style={{ width: '18px', height: '18px', color: stat.color }} />
              </div>

              <p style={{
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--text-1)',
                margin: '0 0 8px 0',
              }}>
                {stat.value}
              </p>

              <p style={{
                fontSize: '12px',
                color: stat.change.startsWith('+') ? '#22c55e' : '#ef4444',
                margin: 0,
                fontWeight: 600,
              }}>
                {stat.change} this month
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Health Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px 0' }}>
          System Health
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Uptime */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Platform Uptime</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.5)',
              }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>
                {metrics.systemUptime.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Response Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Avg Response Time</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
              {metrics.averageResponseTime}ms
            </span>
          </div>

          {/* Error Rate */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Error Rate</span>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: metrics.errorRate < 1 ? '#22c55e' : '#ef4444'
            }}>
              {metrics.errorRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px 0' }}>
          Recent Alerts
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ color: '#22c55e' }}>–œ“</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                All systems operational
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: '4px 0 0 0' }}>
                Last 7 days: 99.98% uptime
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                Database optimization scheduled
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: '4px 0 0 0' }}>
                Tomorrow at 2:00 AM UTC - Expected duration: 15 minutes
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

