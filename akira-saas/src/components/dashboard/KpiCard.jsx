import { motion } from 'framer-motion'
import MiniSparkline from '@/components/charts/MiniSparkline'

export default function KpiCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, sparklineData, sparklineColor, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.25 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '14px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={function(e) {
        e.currentTarget.style.borderColor = 'rgba(230,57,70,0.3)'
        e.currentTarget.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(230,57,70,0.1)'
      }}
      onMouseLeave={function(e) {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {/* Linea de acento superior — siempre roja */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(135deg, #e63946, #cc2936)', opacity: 0.7, borderRadius: '12px 12px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{title}</p>
        {Icon && (
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: iconBg || 'rgba(230,57,70,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '14px', height: '14px', color: iconColor || '#e63946' }} />
          </div>
        )}
      </div>

      <p style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>{value}</p>

      {subtitle && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{subtitle}</p>}

      {sparklineData && sparklineData.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <MiniSparkline data={sparklineData} color={sparklineColor || '#e63946'} height={32} />
        </div>
      )}
    </motion.div>
  )
}