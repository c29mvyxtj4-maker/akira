import { motion } from 'framer-motion'
import { Trash2, Clock, Edit2 } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import EmptyState from '@/shared/components/ui/EmptyState'

/**
 * Display list of time entries
 * Shows: Date, project, description, duration, billable status, actions
 */
export default function TimeEntries({
  entries = [],
  onEdit,
  onDelete,
  loading = false,
}) {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        emoji="–±ï¸"
        title="No time entries yet"
        description="Start tracking time with the timer above to create your first entry."
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
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id || index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: entry.is_running ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${entry.is_running ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.2s',
          }}
          whileHover={{ background: entry.is_running ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)' }}
        >
          {/* Time Dot */}
          {entry.is_running && (
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
          {!entry.is_running && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
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
            <p style={{
              fontSize: '11px',
              color: 'var(--text-4)',
            }}>
              {formatDate(entry.started_at || entry.created_at)}
            </p>
          </div>

          {/* Duration */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-1)',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              {formatDuration(entry.duration_seconds || entry.duration_minutes * 60)}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => onEdit(entry)}
                title="Edit entry"
              />
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => onDelete(entry.id)}
                title="Delete entry"
              />
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

