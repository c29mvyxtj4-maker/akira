import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, Edit2, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

/**
 * TimeEntriesList component - Enhanced list with swipe actions
 *
 * Features:
 * - Swipe gesture detection (mobile)
 * - Hover actions (desktop)
 * - Time formatting
 * - Billable status indicators
 * - Delete/edit actions
 * - Staggered animations
 * - Loading skeletons
 */
export default function TimeEntriesList({
  entries = [],
  onEdit,
  onDelete,
  loading = false,
  onEntryClick,
}) {
  const [swipedId, setSwipedId] = useState(null)
  const [touchStart, setTouchStart] = useState(null)

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e, entryId) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    // Swipe left > 50px to show actions
    if (diff > 50) {
      setSwipedId(entryId)
    } else if (diff < -50) {
      setSwipedId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              height: '60px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        emoji="⏱️"
        title="No time entries"
        description="Start tracking time with the timer to create your first entry."
        size="sm"
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {entries.map((entry, index) => {
        const isActive = entry.is_running
        const isSwiped = swipedId === entry.id

        return (
          <motion.div
            key={entry.id || index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onEntryClick?.(entry)}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, entry.id)}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.06)'}`,
              overflow: 'hidden',
              cursor: onEntryClick ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            whileHover={{
              background: isActive ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)',
              borderColor: isActive ? 'rgba(230,57,70,0.3)' : 'rgba(255,255,255,0.1)',
            }}
          >
            {/* Main Content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                transform: isSwiped ? 'translateX(-80px)' : 'translateX(0)',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Status Dot */}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--brand)',
                    flexShrink: 0,
                    boxShadow: '0 0 6px rgba(230,57,70,0.6)',
                  }}
                />
              )}
              {!isActive && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--text-5)',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-1)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.description || 'Time entry'}
                  </p>
                  {entry.billable && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#22c55e',
                        background: 'rgba(34,197,94,0.15)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      BILLABLE
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-4)',
                    margin: 0,
                  }}
                >
                  {formatDate(entry.started_at || entry.created_at)}
                </p>
              </div>

              {/* Duration */}
              <div
                style={{
                  textAlign: 'right',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-1)',
                    fontFamily: '"JetBrains Mono", monospace',
                    margin: 0,
                  }}
                >
                  {formatDuration(entry.duration_seconds || entry.duration_minutes * 60)}
                </p>
                <ChevronRight
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'var(--text-5)',
                    transform: isSwiped ? 'rotate(-180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Swipe Actions */}
            {isSwiped && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0 8px',
                }}
              >
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSwipedId(null)
                      onEdit(entry)
                    }}
                    title="Edit entry"
                  />
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSwipedId(null)
                      onDelete(entry.id)
                    }}
                    title="Delete entry"
                  />
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
