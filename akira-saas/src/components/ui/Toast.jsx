import React from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
}

export function useToast() {
  const [toasts, setToasts] = React.useState([])

  const show = React.useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const dismiss = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, show, dismiss }
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px',
    }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info
          const Icon = config.icon

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 100 }}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-0)',
                border: `1px solid ${config.color}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <Icon size={18} style={{ color: config.color, flexShrink: 0 }} />
              <span style={{
                fontSize: '13px',
                color: 'var(--text-1)',
                flex: 1,
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => onDismiss(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
