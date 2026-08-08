import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Users, FolderKanban, Wallet, FileText, Clock, CalendarIcon, BookOpen,
} from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'

const PILLS = [
  { label: 'Clientes', icon: Users, to: ROUTES.CLIENTS },
  { label: 'Proyectos', icon: FolderKanban, to: ROUTES.PROJECTS },
  { label: 'Finanzas', icon: Wallet, to: ROUTES.FINANCE },
  { label: 'Facturas', icon: FileText, to: ROUTES.INVOICES },
  { label: 'Time tracking', icon: Clock, to: ROUTES.TIME_TRACKING },
  { label: 'Calendario', icon: CalendarIcon, to: ROUTES.CALENDAR },
  { label: 'Base de conocimiento', icon: BookOpen, to: ROUTES.KNOWLEDGE },
]

const GLOW = { color: 'rgba(230, 57, 70, 0.3)', blur: 12, spread: 2 }

export default function Topbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentOrg: org } = useOrg()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuAnchor = useRef(null)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
  const initial = name?.charAt(0).toUpperCase() || '?'

  const handleSignOut = async () => {
    // Sign out logic would go here
    setMenuOpen(false)
  }

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {/* Avatar */}
        <button
          ref={menuAnchor}
          onClick={() => setMenuOpen(!menuOpen)}
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
        <div
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
          }}
          onClick={() => navigate('/inicio')}
        >
          <Home style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Inicio</span>
        </div>

        {/* Navigation Pills */}
        {PILLS.map((pill) => {
          const Icon = pill.icon
          return (
            <button
              key={pill.label}
              onClick={() => navigate(pill.to)}
              title={pill.label}
              aria-label={pill.label}
              style={{
                position: 'relative',
                width: '40px',
                height: '38px',
                borderRadius: '999px',
                flexShrink: 0,
                background: 'var(--bg-3)',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
