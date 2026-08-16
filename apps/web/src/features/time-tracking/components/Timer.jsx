import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react'
import Button from '@/shared/components/ui/Button'

/**
 * Premium time tracking timer component
 *
 * Features:
 * - Large, visible timer display
 * - Play/pause/stop controls
 * - Progress indication
 * - Smart time formatting (hh:mm:ss)
 * - Keyboard support (space to play/pause)
 */
export default function Timer({
  isRunning = false,
  seconds = 0,
  projectName = '',
  clientName = '',
  onStart,
  onPause,
  onStop,
  onComplete,
  disabled = false,
}) {
  const [displaySeconds, setDisplaySeconds] = useState(seconds)
  const intervalRef = useRef(null)

  // Update timer display
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setDisplaySeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  // Keyboard support: spacebar to play/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !disabled && (e.target === document.body || e.target.tagName === 'BODY')) {
        e.preventDefault()
        if (isRunning) onPause?.()
        else onStart?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, disabled, onStart, onPause])

  // Format seconds as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const timeString = formatTime(displaySeconds)
  const hours = Math.floor(displaySeconds / 3600)
  const minutes = Math.floor((displaySeconds % 3600) / 60)
  const totalMinutes = hours * 60 + minutes

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(230,57,70,0.05))',
        border: '1px solid rgba(230,57,70,0.2)',
      }}
    >
      {/* Context Info */}
      {(projectName || clientName) && (
        <div>
          {projectName && (
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '4px' }}>
              {projectName}
            </p>
          )}
          {clientName && (
            <p style={{ fontSize: '12px', color: 'var(--text-4)' }}>
              {clientName}
            </p>
          )}
        </div>
      )}

      {/* Large Timer Display */}
      <motion.div
        animate={isRunning ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          textAlign: 'center',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: isRunning ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isRunning ? 'rgba(230,57,70,0.3)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 900,
            color: isRunning ? 'var(--brand)' : 'var(--text-1)',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '2px',
            textShadow: isRunning ? '0 0 12px rgba(230,57,70,0.3)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {timeString}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '8px' }}>
          {totalMinutes === 1 ? '1 minute' : `${totalMinutes} minutes`}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${Math.min((displaySeconds / 3600) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: 'var(--gradient-brand)',
              borderRadius: '2px',
            }}
          />
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-5)', textAlign: 'right' }}>
          Est. {(displaySeconds / 3600).toFixed(2)}h logged
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isRunning ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1 }}
          >
            <Button
              variant="secondary"
              icon={<Pause className="w-4 h-4" />}
              onClick={onPause}
              disabled={disabled}
              style={{ width: '100%' }}
            >
              Pause (Space)
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1 }}
          >
            <Button
              variant="primary"
              icon={<Play className="w-4 h-4" />}
              onClick={onStart}
              disabled={disabled}
              style={{ width: '100%' }}
            >
              Start (Space)
            </Button>
          </motion.div>
        )}

        <Button
          variant="ghost"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={() => setDisplaySeconds(0)}
          disabled={disabled || displaySeconds === 0}
          title="Reset timer"
        />

        <Button
          variant="secondary"
          icon={<CheckCircle className="w-4 h-4" />}
          onClick={onComplete}
          disabled={disabled || displaySeconds === 0}
          title="Save time entry"
        />
      </div>

      {/* Tip */}
      <p style={{ fontSize: '11px', color: 'var(--text-5)', textAlign: 'center' }}>
        ðŸ’¡ Press <kbd style={{ background: 'var(--bg-3)', padding: '1px 4px', borderRadius: '3px' }}>Space</kbd> to start/pause
      </p>
    </motion.div>
  )
}

