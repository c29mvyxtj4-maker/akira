import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { DUR, EASE } from '@/config/motion'

/*
 * Página base para funciones planificadas pero aún sin backend. Deja el botón
 * llevando a un sitio real (no a un enlace roto) y explica qué hará.
 */
export default function ComingSoonPage({ icon: Icon, title, description, bullets }) {
  var navigate = useNavigate()
  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--bg-base)', paddingTop: 'calc(var(--safe-top) + 14px)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px calc(var(--safe-bottom) + 40px)' }}>
        <button type="button" onClick={function() { navigate('/inicio') }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', marginBottom: '24px' }}>
          <ChevronLeft style={{ width: '16px', height: '16px' }} /> Inicio
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.slow, ease: EASE.out }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--brand-dim)', border: '1px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            {Icon && <Icon style={{ width: '26px', height: '26px', color: 'var(--brand)' }} />}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{title}</h1>
          <span style={{ marginTop: '10px', fontSize: '11px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: '999px', background: 'var(--brand-dim)', border: '1px solid var(--brand-border)' }}>En construcción</span>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', lineHeight: 1.6, marginTop: '16px', maxWidth: '440px' }}>{description}</p>
        </motion.div>

        {bullets && bullets.length > 0 && (
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bullets.map(function(b, i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>{b}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
