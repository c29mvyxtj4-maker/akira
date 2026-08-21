import { motion } from 'framer-motion'

var SIZE = {
  sm: { icon: 28, wrap: 48, title: '13px', desc: '11px', pad: '24px 16px' },
  md: { icon: 36, wrap: 60, title: '15px', desc: '13px', pad: '40px 20px' },
  lg: { icon: 44, wrap: 72, title: '18px', desc: '14px', pad: '60px 24px' },
}

/**
 * EmptyState component with contextual guidance
 *
 * Improvements:
 * - Shows quick-start action button
 * - Hints about keyboard shortcuts
 * - Gradient icon background
 * - Smooth entrance animation
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel = 'Create',
  actionShortcut,
  size = 'md',
  className,
  emoji,
}) {
  var s = SIZE[size] || SIZE.md

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: s.pad,
      }}
      className={className}
      role="status"
      aria-live="polite"
    >
      {/* Icon Container */}
      {Icon || emoji ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            width: s.wrap + 'px',
            height: s.wrap + 'px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(230,57,70,0.05))',
            border: '1px solid rgba(230,57,70,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            flexShrink: 0,
          }}
        >
          {emoji ? (
            <span style={{ fontSize: s.icon + 'px' }}>{emoji}</span>
          ) : (
            <Icon style={{ width: s.icon + 'px', height: s.icon + 'px', color: 'var(--text-5)' }} />
          )}
        </motion.div>
      ) : null}

      {/* Title */}
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          style={{
            fontSize: s.title,
            fontWeight: 700,
            color: 'var(--text-1)',
            marginBottom: '6px',
          }}
        >
          {title}
        </motion.h3>
      )}

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            fontSize: s.desc,
            color: 'var(--text-4)',
            maxWidth: '320px',
            lineHeight: 1.6,
            marginBottom: action ? '24px' : 0,
          }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          {action}
        </motion.div>
      )}

      {/* Keyboard Shortcut Hint */}
      {actionShortcut && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            fontSize: '11px',
            color: 'var(--text-5)',
            marginTop: '12px',
          }}
        >
          Tip: Press <kbd style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{actionShortcut}</kbd> to create
        </motion.p>
      )}
    </motion.div>
  )
}