import { motion } from 'framer-motion'
import { TrendingUp, Clock, Target } from 'lucide-react'

/**
 * WeeklySummary component - Sidebar widget showing weekly time tracking metrics
 *
 * Features:
 * - Total hours this week
 * - Billable vs non-billable breakdown
 * - Billable rate calculation
 * - Progress toward weekly goal
 * - Color-coded indicators
 * - Smooth animations
 */
export default function WeeklySummary({
  totalSeconds = 0,
  billableSeconds = 0,
  weeklyGoalHours = 40,
  hourlyRate = 50,
  title = 'This Week',
}) {
  const totalHours = totalSeconds / 3600
  const billableHours = billableSeconds / 3600
  const nonBillableHours = (totalSeconds - billableSeconds) / 3600
  const billableAmount = billableHours * hourlyRate
  const progressPercent = Math.min((totalHours / weeklyGoalHours) * 100, 100)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Total Hours */}
      <motion.div
        variants={itemVariants}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
          border: '1px solid rgba(34,197,94,0.2)',
          padding: '16px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: 0, marginBottom: '6px' }}>
          {title}
        </p>
        <p
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#22c55e',
            margin: 0,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {totalHours.toFixed(1)}h
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
          {Math.round(totalHours)} hours logged
        </p>
      </motion.div>

      {/* Progress Toward Goal */}
      <motion.div
        variants={itemVariants}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Target style={{ width: '16px', height: '16px', color: 'var(--text-4)' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-4)', margin: 0 }}>
            Goal: {weeklyGoalHours}h
          </p>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: progressPercent >= 100 ? '#22c55e' : 'var(--gradient-brand)',
              borderRadius: '3px',
            }}
          />
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-5)', margin: '8px 0 0 0' }}>
          {progressPercent >= 100 ? '✅ Goal reached!' : `${Math.round(weeklyGoalHours - totalHours)}h remaining`}
        </p>
      </motion.div>

      {/* Billable Breakdown */}
      <motion.div
        variants={itemVariants}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>Billable</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>
              {billableHours.toFixed(1)}h
            </span>
          </div>
          <div
            style={{
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${(billableHours / totalHours) * 100 || 0}%` }}
              transition={{ duration: 0.6 }}
              style={{
                height: '100%',
                background: '#22c55e',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>Non-billable</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-3)' }}>
              {nonBillableHours.toFixed(1)}h
            </span>
          </div>
          <div
            style={{
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${(nonBillableHours / totalHours) * 100 || 0}%` }}
              transition={{ duration: 0.6 }}
              style={{
                height: '100%',
                background: 'var(--text-5)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Billable Amount */}
      {hourlyRate > 0 && (
        <motion.div
          variants={itemVariants}
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))',
            border: '1px solid rgba(59,130,246,0.2)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: 0 }}>
              Billable Amount
            </p>
          </div>
          <p
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#3b82f6',
              margin: 0,
            }}
          >
            €{billableAmount.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
            @ €{hourlyRate}/hour
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
