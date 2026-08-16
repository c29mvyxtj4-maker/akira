import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { GLOBAL_SHORTCUTS, CONTEXT_SHORTCUTS } from '@/shared/hooks/useKeyboardShortcuts'

/**
 * Modal showing all available keyboard shortcuts
 * Opened with Cmd+? or visible in help menu
 */
export default function KeyboardShortcutsModal({ isOpen, onClose, context = 'global' }) {
  const [filteredShortcuts, setFilteredShortcuts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isOpen) return

    // Close on Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    // Combine global and context shortcuts
    const allShortcuts = [
      ...GLOBAL_SHORTCUTS,
      ...(CONTEXT_SHORTCUTS[context] || []),
    ]

    // Filter by search term
    if (searchTerm) {
      setFilteredShortcuts(
        allShortcuts.filter(
          (s) =>
            s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredShortcuts(allShortcuts)
    }
  }, [searchTerm, context])

  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(shortcut)
    return groups
  }, {})

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-full mx-4"
        style={{
          background: 'var(--bg-2)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-1)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              style={{ marginBottom: '24px' }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-4)',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  letterSpacing: '0.5px',
                }}
              >
                {category}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--bg-3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: 'var(--text-2)' }}>{shortcut.label}</span>
                    <code
                      style={{
                        background: 'var(--bg-1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-3)',
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {formatShortcut(shortcut)}
                    </code>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-4)',
              }}
            >
              <p>No shortcuts found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--text-5)',
          }}
        >
          Press <kbd style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: '3px' }}>ESC</kbd> to close
        </div>
      </motion.div>
    </>
  )
}

/**
 * Format shortcut keys for display
 */
function formatShortcut(shortcut) {
  const parts = []

  // Map keys to display names
  const keyMap = {
    'ctrl': 'Ctrl',
    'cmd': 'Cmd',
    'meta': 'Cmd',
    'shift': 'Shift',
    'alt': 'Alt',
    'enter': 'Enter',
    'escape': 'Esc',
    'arrowup': '–†‘',
    'arrowdown': '–†“',
    'arrowleft': '–†',
    'arrowright': '–†’',
  }

  // Platform-specific modifier
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

  if (shortcut.ctrlKey) {
    parts.push(isMac ? '–Œ˜' : 'Ctrl')
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '–Œ¥' : 'Alt')
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '–‡§' : 'Shift')
  }

  const displayKey = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase()
  parts.push(displayKey)

  return parts.join(isMac ? ' ' : '+')
}

