import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calendar, MessageSquare, Mail } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/context/AuthContext'

export default function Topbar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
  const initial = name?.charAt(0).toUpperCase() || '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: 'calc(var(--safe-top) + 12px) 24px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Avatar */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          aria-label="Tu cuenta"
          style={{
            width: '38px',
            height: '38px',
            flexShrink: 0,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--gradient-brand)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          {initial}
        </button>

        {/* Inicio Pill */}
        <button
          onClick={() => navigate('/inicio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            background: 'var(--brand-dim)',
            border: '1px solid var(--brand-border)',
            color: 'var(--brand)',
            flexShrink: 0,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <Home style={{ width: '16px', height: '16px' }} />
          <span>Inicio</span>
        </button>

        {/* Quick Icons */}
        <button
          onClick={() => navigate(ROUTES.CALENDAR)}
          title="Calendario"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-3)',
            border: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar style={{ width: '18px', height: '18px' }} />
        </button>

        <button
          onClick={() => navigate(ROUTES.BRAIN)}
          title="Mensajes"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-3)',
            border: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageSquare style={{ width: '18px', height: '18px' }} />
        </button>

        <button
          onClick={() => navigate(ROUTES.INVOICES)}
          title="Correo"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-3)',
            border: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </motion.div>
  )
}
