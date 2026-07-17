import { motion } from 'framer-motion'

/**
 * TimerDisplay component - Minimal timer display (HH:MM:SS)
 *
 * Features:
 * - Clean monospace display
 * - Real-time updates
 * - Smooth animations
 * - Compact and reusable
 */
export default function TimerDisplay({
  seconds = 0,
  isRunning = false,
  variant = 'large',
  showLabel = true,
  showProgress = false,
}) {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const sizeConfig = {
    small: { fontSize: '20px', gap: '4px' },
    medium: { fontSize: '32px', gap: '8px' },
    large: { fontSize: '48px', gap: '12px' },
  }

  const config = sizeConfig[variant] || sizeConfig.large
  const timeString = formatTime(seconds)
  const totalMinutes = Math.floor(seconds / 60)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: config.gap }}>
      {/* Timer Display */}
      <motion.div
        animate={isRunning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: config.fontSize,
          fontWeight: 900,
          color: isRunning ? 'var(--brand)' : 'var(--text-1)',
          letterSpacing: '1px',
          textShadow: isRunning ? '0 0 12px rgba(230,57,70,0.3)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {timeString}
      </motion.div>

      {/* Progress Bar */}
      {showProgress && (
        <div
          style={{
            width: '100%',
            maxWidth: '200px',
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${Math.min((seconds / 3600) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: 'var(--gradient-brand)',
              borderRadius: '2px',
            }}
          />
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <motion.p
          animate={{ opacity: isRunning ? [0.7, 1, 0.7] : 1 }}
          transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          style={{
            fontSize: '12px',
            color: 'var(--text-4)',
            margin: 0,
          }}
        >
          {totalMinutes === 1 ? '1 minute' : `${totalMinutes} minutes`}
        </motion.p>
      )}
    </div>
  )
}
