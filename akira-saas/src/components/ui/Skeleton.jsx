import { motion } from 'framer-motion'

const pulse = {
  initial: { opacity: 0.6 },
  animate: { opacity: 0.3 },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
}

/**
 * Skeleton component for loading states
 * Matches actual content width/height
 */
export function SkeletonText({ width = '100%', height = '16px', lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          variants={pulse}
          initial="initial"
          animate="animate"
          style={{
            width: i === lines - 1 ? '75%' : width,
            height,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-5)',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton for card-like content
 */
export function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '16px',
        backgroundColor: 'var(--bg-2)',
      }}
    >
      {/* Avatar skeleton */}
      <motion.div
        variants={pulse}
        initial="initial"
        animate="animate"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--text-5)',
          marginBottom: '12px',
        }}
      />

      {/* Title skeleton */}
      <motion.div
        variants={pulse}
        initial="initial"
        animate="animate"
        style={{
          width: '70%',
          height: '16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--text-5)',
          marginBottom: '8px',
        }}
      />

      {/* Description skeleton (2 lines) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <motion.div
          variants={pulse}
          initial="initial"
          animate="animate"
          style={{
            width: '100%',
            height: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-5)',
          }}
        />
        <motion.div
          variants={pulse}
          initial="initial"
          animate="animate"
          style={{
            width: '85%',
            height: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-5)',
          }}
        />
      </div>
    </motion.div>
  )
}

/**
 * Skeleton for table rows
 */
export function SkeletonTableRow({ columns = 4, className = '' }) {
  return (
    <motion.div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <motion.div
          key={i}
          variants={pulse}
          initial="initial"
          animate="animate"
          style={{
            width: '100%',
            height: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-5)',
          }}
        />
      ))}
    </motion.div>
  )
}

/**
 * Skeleton for page header
 */
export function SkeletonPageHeader({ className = '' }) {
  return (
    <div className={className}>
      {/* Page title */}
      <motion.div
        variants={pulse}
        initial="initial"
        animate="animate"
        style={{
          width: '40%',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--text-5)',
          marginBottom: '12px',
        }}
      />

      {/* Subtitle */}
      <motion.div
        variants={pulse}
        initial="initial"
        animate="animate"
        style={{
          width: '60%',
          height: '16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--text-5)',
        }}
      />
    </div>
  )
}

/**
 * Skeleton for form fields
 */
export function SkeletonInput({ className = '' }) {
  return (
    <motion.div
      variants={pulse}
      initial="initial"
      animate="animate"
      className={className}
      style={{
        width: '100%',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--text-5)',
      }}
    />
  )
}

export default SkeletonText
