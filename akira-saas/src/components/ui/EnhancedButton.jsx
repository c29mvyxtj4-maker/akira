import { motion } from 'framer-motion'
import clsx from 'clsx'

const VARIANT_CLASS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
  ghost: 'btn btn-ghost',
}

const SIZE_STYLE = {
  xs: { padding: '4px 10px', fontSize: '11px', gap: '4px', height: '26px' },
  sm: { padding: '5px 12px', fontSize: '12px', gap: '5px', height: '30px' },
  md: { padding: '7px 14px', fontSize: '12.5px', gap: '6px', height: '34px' },
  lg: { padding: '9px 18px', fontSize: '13px', gap: '7px', height: '38px' },
}

/**
 * EnhancedButton with premium spring physics animations
 *
 * Features:
 * - Spring-based physics motion (stiffness: 400, damping: 30)
 * - Smooth hover elevation
 * - Press-to-confirm feedback
 * - Loading state with spinner animation
 * - Disabled state handling
 * - Full accessibility support
 */
export default function EnhancedButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  style,
  title,
  fullWidth = false,
}) {
  const sStyle = SIZE_STYLE[size] || SIZE_STYLE.md
  const cls = VARIANT_CLASS[variant] || VARIANT_CLASS.primary
  const isDisabledOrLoading = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabledOrLoading}
      title={title}
      whileHover={!isDisabledOrLoading ? { y: -2, scale: 1.01 } : {}}
      whileTap={!isDisabledOrLoading ? { scale: 0.97, y: 0 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      className={clsx(cls, 'transition-all duration-200', fullWidth && 'w-full', className)}
      style={{
        ...sStyle,
        opacity: isDisabledOrLoading ? 0.55 : 1,
        cursor: isDisabledOrLoading ? 'not-allowed' : 'pointer',
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      aria-busy={loading}
    >
      {loading ? (
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </motion.svg>
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </motion.button>
  )
}
