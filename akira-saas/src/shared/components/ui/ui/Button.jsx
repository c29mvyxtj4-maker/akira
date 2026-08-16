import { motion } from 'framer-motion'
import clsx from 'clsx'

var VARIANT_CLASS = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger:    'btn btn-danger',
  ghost:     'btn btn-ghost',
}

var SIZE_STYLE = {
  xs: { padding: '4px 10px', fontSize: '11px', gap: '4px', height: '26px' },
  sm: { padding: '5px 12px', fontSize: '12px', gap: '5px', height: '30px' },
  md: { padding: '7px 14px', fontSize: '12.5px', gap: '6px', height: '34px' },
  lg: { padding: '9px 18px', fontSize: '13px', gap: '7px', height: '38px' },
}

/**
 * Enhanced Button with premium micro-interactions
 * - Scale feedback on press (0.98)
 * - Smooth transitions
 * - Disabled state handling
 * - Loading spinner
 */
export default function Button({
  children, variant = 'primary', size = 'md',
  icon, loading, disabled, onClick, type = 'button',
  className, style, title,
}) {
  var sStyle = SIZE_STYLE[size] || SIZE_STYLE.md
  var cls    = VARIANT_CLASS[variant] || VARIANT_CLASS.primary
  var isDisabledOrLoading = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabledOrLoading}
      title={title}
      whileHover={!isDisabledOrLoading ? { y: -1 } : {}}
      whileTap={!isDisabledOrLoading ? { scale: 0.98, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={clsx(cls, 'transition-all duration-200', className)}
      style={{
        ...sStyle,
        opacity: isDisabledOrLoading ? 0.55 : 1,
        cursor: isDisabledOrLoading ? 'not-allowed' : 'pointer',
        ...style,
      }}
      aria-busy={loading}
    >
      {loading ? (
        <svg
          width="12" height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}