import { useState } from 'react'
import { ChevronDown, User, Edit, Trash, Plus, Shield, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ACTION_ICONS = {
  create: Plus,
  update: Edit,
  delete: Trash,
  view: FileText,
  login: Shield,
}

const ACTION_COLORS = {
  create: '#22c55e',
  update: '#3b82f6',
  delete: '#ef4444',
  view: '#8b5cf6',
  login: '#06b6d4',
}

export default function AuditTimeline({ logs }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!logs || logs.length === 0) {
    return (
      <div style={{
        padding: '48px 32px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
      }}>
        No hay eventos de auditoría
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      padding: '32px 0',
    }}>
      {logs.map((log, idx) => {
        const ActionIcon = ACTION_ICONS[log.action] || Edit
        const actionColor = ACTION_COLORS[log.action] || '#8b5cf6'
        const isExpanded = expandedId === log.id

        return (
          <div key={log.id} style={{ marginBottom: '24px', position: 'relative' }}>
            {/* Timeline line */}
            {idx < logs.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '56px',
                width: '2px',
                height: '24px',
                background: 'rgba(255,255,255,0.1)',
              }} />
            )}

            {/* Timeline dot + content */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Dot */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: actionColor + '20',
                border: `2px solid ${actionColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '8px',
              }}>
                <ActionIcon size={18} style={{ color: actionColor }} />
              </div>

              {/* Content */}
              <motion.div
                layout
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background 200ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#f1f1f4',
                      textTransform: 'capitalize',
                    }}>
                      {log.action} — {log.table_name}
                    </h4>
                    <p style={{
                      margin: '0 0 6px 0',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <User size={12} />
                      {log.user_email || 'Sistema'}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {new Date(log.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ flexShrink: 0 }}
                  >
                    <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </motion.div>
                </button>

                {/* Expandable details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {/* Record ID */}
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          margin: '0 0 4px 0',
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.5)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          Record ID
                        </p>
                        <code style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#a1e8f9',
                          background: 'rgba(161, 232, 249, 0.05)',
                          padding: '8px',
                          borderRadius: '6px',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                        }}>
                          {log.record_id}
                        </code>
                      </div>

                      {/* Old values */}
                      {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}>
                            Valores anteriores
                          </p>
                          <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: '12px',
                            color: '#fca5a5',
                            fontFamily: 'monospace',
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* New values */}
                      {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <div>
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}>
                            Nuevos valores
                          </p>
                          <div style={{
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: '12px',
                            color: '#86efac',
                            fontFamily: 'monospace',
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
