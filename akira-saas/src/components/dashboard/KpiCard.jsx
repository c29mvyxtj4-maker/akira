import { motion } from 'framer-motion'
import MiniSparkline from '@/components/charts/MiniSparkline'

export default function KpiCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, sparklineData, sparklineColor, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: delay || 0, duration: 0.25, ease: 'easeOut' } }}
      whileHover={{ scale: 1.035 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={function(e) {
        e.currentTarget.style.borderColor = 'var(--brand-border)'
        e.currentTarget.style.boxShadow   = '0 2px 8px rgba(0,0,0,0.04)'
      }}
      onMouseLeave={function(e) {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {/* Linea de acento superior — siempre roja */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--brand)', opacity: 0.55, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{title}</p>
        {Icon && (
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: iconBg || 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '14px', height: '14px', color: iconColor || 'var(--brand)' }} />
          </div>
        )}
      </div>

      <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>{value}</p>

      {subtitle && <p style={{ fontSize: '11px', color: 'var(--text-4)', lineHeight: 1.4 }}>{subtitle}</p>}

      {sparklineData && sparklineData.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <MiniSparkline data={sparklineData} color={sparklineColor || '#e63946'} height={32} />
        </div>
      )}
    </motion.div>
  )
}