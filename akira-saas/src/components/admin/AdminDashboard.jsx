import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, DollarSign, Zap, AlertCircle,
  Server, Activity, BarChart3
} from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Admin Dashboard
 * Platform-wide system metrics and analytics
 */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 1542,
    activeSubscriptions: 342,
    monthlyRecurringRevenue: 42580,
    totalApiCalls: 2850000,
    averageResponseTime: 125,
    systemUptime: 99.98,
    errorRate: 0.02,
    totalRequests: 8432100,
  })

  const stats = [
    {
      label: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      color: '#3b82f6',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Active Subscriptions',
      value: metrics.activeSubscriptions,
      icon: DollarSign,
      color: '#22c55e',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Monthly Revenue',
      value: `$${(metrics.monthlyRecurringRevenue / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      color: '#f59e0b',
      change: '+15%',
      trend: 'up'
    },
    {
      label: 'API Calls/Day',
      value: (metrics.totalApiCalls / 1000).toFixed(0) + 'k',
      icon: Zap,
      color: '#8b5cf6',
      change: '+25%',
      trend: 'up'
    },
  ]

  const healthMetrics = [
    {
      label: 'Platform Uptime',
      value: `${metrics.systemUptime}%`,
      status: 'healthy',
      icon: Server,
    },
    {
      label: 'Avg Response Time',
      value: `${metrics.averageResponseTime}ms`,
      status: 'healthy',
      icon: Activity,
    },
    {
      label: 'Error Rate',
      value: `${metrics.errorRate.toFixed(3)}%`,
      status: metrics.errorRate < 1 ? 'healthy' : 'warning',
      icon: AlertCircle,
    },
    {
      label: 'Total Requests',
      value: (metrics.totalRequests / 1000000).toFixed(1) + 'M',
      status: 'healthy',
      icon: BarChart3,
    },
  ]

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'text-status-success'
    if (status === 'warning') return 'text-status-warning'
    return 'text-status-danger'
  }

  const getStatusBgColor = (status) => {
    if (status === 'healthy') return 'bg-status-success/10 border-status-success/20'
    if (status === 'warning') return 'bg-status-warning/10 border-status-warning/20'
    return 'bg-status-danger/10 border-status-danger/20'
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card padding="lg" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    stat.trend === 'up'
                      ? 'text-status-success bg-status-success/10'
                      : 'text-status-danger bg-status-danger/10'
                  }`}>
                    {stat.change}
                  </span>
                </div>

                <p className="text-xs font-semibold text-text-4 uppercase tracking-wide mb-1">
                  {stat.label}
                </p>

                <p className="text-2xl font-bold text-text-1">
                  {stat.value}
                </p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Health Status Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map((metric, i) => {
            const Icon = metric.icon
            return (
              <Card
                key={i}
                padding="lg"
                className={`${getStatusBgColor(metric.status)} border`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-text-4 uppercase tracking-wide mb-2">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-text-1">
                      {metric.value}
                    </p>
                  </div>
                  <Icon size={24} className={getStatusColor(metric.status)} />
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-bold text-text-1 mb-4">System Services</h3>
          <div className="space-y-3">
            {[
              { name: 'API Server', status: 'operational', uptime: 99.99 },
              { name: 'Database', status: 'operational', uptime: 99.98 },
              { name: 'Cache Layer', status: 'operational', uptime: 100.0 },
              { name: 'Message Queue', status: 'operational', uptime: 99.97 },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-status-success" />
                  <span className="font-medium text-text-1 text-sm">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-4 px-2 py-1 bg-surface-2 rounded">
                    {service.status}
                  </span>
                  <span className="text-xs font-semibold text-status-success">
                    {service.uptime}% uptime
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-bold text-text-1 mb-4">Recent Alerts</h3>

          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-lg bg-status-success/10 border border-status-success/20">
              <div className="text-status-success flex-shrink-0 mt-0.5">✓</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-1">All systems operational</p>
                <p className="text-xs text-text-4 mt-1">
                  Last 7 days: 99.98% uptime across all services
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-status-info/10 border border-status-info/20">
              <AlertCircle size={16} className="text-status-info flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-1">Database optimization scheduled</p>
                <p className="text-xs text-text-4 mt-1">
                  Tomorrow at 2:00 AM UTC - Expected duration: 15 minutes (minimal disruption)
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
              <AlertCircle size={16} className="text-status-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-1">Certificate expiration in 30 days</p>
                <p className="text-xs text-text-4 mt-1">
                  SSL certificate renewal scheduled for August 17, 2026
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-bold text-text-1 mb-4">Recent Activity</h3>

          <div className="space-y-4">
            {[
              { time: '2 hours ago', action: 'Database backup completed', type: 'success' },
              { time: '5 hours ago', action: 'New user registration spike detected', type: 'info' },
              { time: '1 day ago', action: 'API rate limit adjustment implemented', type: 'info' },
              { time: '2 days ago', action: 'Performance optimization deployed', type: 'success' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    activity.type === 'success'
                      ? 'bg-status-success'
                      : 'bg-status-info'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-1">{activity.action}</p>
                  <p className="text-xs text-text-4 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
