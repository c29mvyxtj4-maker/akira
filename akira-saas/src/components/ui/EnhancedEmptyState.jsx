import { motion } from 'framer-motion'

const SIZE = {
  sm: { icon: 28, wrap: 48, title: '13px', desc: '11px', pad: '24px 16px' },
  md: { icon: 36, wrap: 60, title: '15px', desc: '13px', pad: '40px 20px' },
  lg: { icon: 44, wrap: 72, title: '18px', desc: '14px', pad: '60px 24px' },
}

/**
 * EnhancedEmptyState with premium animations
 *
 * Features:
 * - Staggered animations for icon, title, description
 * - Gradient icon background
 * - Smooth entrance with scale + fade
 * - Keyboard shortcut hints
 * - Quick-start action button
 * - ARIA labels for accessibility
 */
export default function EnhancedEmptyState({
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
  const s = SIZE[size] || SIZE.md

  // Stagger container for smooth sequential animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Icon Container */}
        {Icon || emoji ? (
          <motion.div
            variants={itemVariants}
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
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: s.icon + 'px', display: 'block' }}
              >
                {emoji}
              </motion.span>
            ) : (
              <Icon style={{ width: s.icon + 'px', height: s.icon + 'px', color: 'var(--text-5)' }} />
            )}
          </motion.div>
        ) : null}

        {/* Title */}
        {title && (
          <motion.h3
            variants={itemVariants}
            style={{
              fontSize: s.title,
              fontWeight: 700,
              color: 'var(--text-1)',
              marginBottom: '6px',
              margin: 0,
            }}
          >
            {title}
          </motion.h3>
        )}

        {/* Description */}
        {description && (
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: s.desc,
              color: 'var(--text-4)',
              maxWidth: '320px',
              lineHeight: 1.6,
              marginBottom: action ? '24px' : 0,
              margin: 0,
            }}
          >
            {description}
          </motion.p>
        )}

        {/* Action Button */}
        {action && (
          <motion.div
            variants={itemVariants}
          >
            {action}
          </motion.div>
        )}

        {/* Keyboard Shortcut Hint */}
        {actionShortcut && (
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '11px',
              color: 'var(--text-5)',
              marginTop: '12px',
              margin: 0,
            }}
          >
            Tip: Press{' '}
            <kbd
              style={{
                background: 'var(--bg-3)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
              }}
            >
              {actionShortcut}
            </kbd>{' '}
            to {actionLabel.toLowerCase()}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}
