import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'

/**
 * OperativesMetricsDashboard - Enhanced performance tracking for AI operatives
 *
 * Features:
 * - Success rate display with trends
 * - Average execution time tracking
 * - Total runs count
 * - Error rate monitoring
 * - Trend indicators (up/down)
 * - Smooth staggered animations
 * - Color-coded status indicators
 * - Hover elevation effects
 */
export default function OperativesMetricsDashboard({
  metrics = {},
  loading = false,
}) {
  const defaultMetrics = {
    totalRuns: 0,
    successCount: 0,
    errorCount: 0,
    averageExecutionTime: 0,
    successRate: 0,
    errorRate: 0,
    trend: 0,
    lastRun: null,
    ...metrics,
  }

  const {
    totalRuns,
    successCount,
    errorCount,
    averageExecutionTime,
    successRate,
    errorRate,
    trend,
    lastRun,
  } = defaultMetrics

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, trendValue }) => (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header with Icon & Trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: '20px', height: '20px', color: color }} />
        </div>

        {trendValue !== undefined && trendValue !== 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              background: trendValue >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              borderRadius: '6px',
            }}
          >
            <TrendingUp
              style={{
                width: '12px',
                height: '12px',
                color: trendValue >= 0 ? '#22c55e' : '#ef4444',
                transform: trendValue < 0 ? 'rotate(180deg)' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: trendValue >= 0 ? '#22c55e' : '#ef4444',
              }}
            >
              {Math.abs(trendValue)}%
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: 0 }}>
        {title}
      </p>

      {/* Value */}
      <p
        style={{
          fontSize: '28px',
          fontWeight: 900,
          color: 'var(--text-1)',
          margin: 0,
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: '11px', color: 'var(--text-5)', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              height: '160px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {/* Total Runs */}
      <MetricCard
        icon={Zap}
        title="Total Runs"
        value={totalRuns}
        subtitle={`${successCount} successful`}
        color="var(--brand)"
      />

      {/* Success Rate */}
      <MetricCard
        icon={CheckCircle}
        title="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        subtitle={`${successCount} of ${totalRuns} runs`}
        color="#22c55e"
        trendValue={trend}
      />

      {/* Avg Execution Time */}
      <MetricCard
        icon={Clock}
        title="Avg Execution"
        value={`${averageExecutionTime.toFixed(1)}s`}
        subtitle="Per run"
        color="#3b82f6"
      />

      {/* Error Rate */}
      <MetricCard
        icon={AlertCircle}
        title="Error Rate"
        value={`${errorRate.toFixed(1)}%`}
        subtitle={`${errorCount} errors`}
        color={errorRate > 5 ? '#ef4444' : '#f59e0b'}
      />

      {/* Last Execution Info - spans all if available */}
      {lastRun && (
        <motion.div
          variants={cardVariants}
          style={{
            gridColumn: 'span 1',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
            border: '1px solid rgba(34,197,94,0.2)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: '0 0 4px 0' }}>
            Last Execution
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e', margin: 0 }}>
            {lastRun.operative || 'Recent run'} ✅
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
            {new Date(lastRun.timestamp).toLocaleTimeString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
