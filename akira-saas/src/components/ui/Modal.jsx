import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

var SIZE_W = { sm: '420px', md: '540px', lg: '680px', xl: '860px', full: '95vw' }

export default function Modal({ open, onClose, title, description, children, size = 'md' }) {
  useEffect(function() {
    function onKey(e) { if (e.key === 'Escape' && open) onClose() }
    document.addEventListener('keydown', onKey)
    return function() { document.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={function(e) { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="modal-box"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: SIZE_W[size] || SIZE_W.md }}
            onClick={function(e) { e.stopPropagation() }}
          >
            <div className="modal-header">
              <div>
                {title && (
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h2>
                )}
                {description && (
                  <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '3px' }}>{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-4)', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(230,57,70,0.15)'; e.currentTarget.style.color = 'var(--brand)' }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'var(--bg-4)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}