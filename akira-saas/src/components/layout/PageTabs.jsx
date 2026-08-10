import { motion } from 'framer-motion'

/**
 * PageTabs — Navegación secundaria por tabs
 *
 * Props:
 *   tabs: Array<{ label, value, count?, icon? }>
 *   activeTab: string (value del tab activo)
 *   onChange: (value) => void
 */
export default function PageTabs({ tabs = [], activeTab, onChange }) {
  if (!tabs.length) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-2) var(--space-4)',
      overflowX: 'auto',
      scrollBehavior: 'smooth',
    }}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.value}
          onClick={() => onChange?.(tab.value)}
          whileHover={{ backgroundColor: 'var(--bg-2)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === tab.value ? 'var(--bg-2)' : 'transparent',
            color: activeTab === tab.value ? 'var(--text-1)' : 'var(--text-3)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: activeTab === tab.value ? 600 : 500,
            transition: 'all var(--dur-fast) var(--ease-out)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {tab.icon && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {tab.icon}
            </span>
          )}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span style={{
              background: 'var(--bg-3)',
              color: 'var(--text-3)',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              marginLeft: 'var(--space-1)',
            }}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.value && (
            <motion.div
              layoutId="tab-indicator"
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: 0,
                right: 0,
                height: '2px',
                background: 'var(--brand)',
                borderRadius: '1px',
              }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}
