import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ICONS  = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
const STYLES = {
  success: 'border-status-success/30 bg-status-success/10 text-status-success',
  error:   'border-status-danger/30  bg-status-danger/10  text-status-danger',
  warning: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
  info:    'border-status-info/30    bg-status-info/10    text-status-info',
}

export default function Toast({ toast, onClose }) {
  const Icon = ICONS[toast.type] || Info

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border text-sm max-w-xs shadow-modal',
        'bg-surface-2',
        STYLES[toast.type] || STYLES.info
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1 text-text-1 font-medium">{toast.message}</span>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}