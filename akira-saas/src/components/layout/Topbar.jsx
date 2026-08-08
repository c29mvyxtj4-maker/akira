import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/constants'

const CATEGORIES = [
  { label: 'Inicio', icon: '🏠', route: '/inicio' },
  { label: 'Clientes', icon: '👥', route: '/clients' },
  { label: 'Proyectos', icon: '📋', route: '/projects' },
  { label: 'Finanzas', icon: '💰', route: '/finance' },
  { label: 'Facturas', icon: '📄', route: '/invoices' },
  { label: 'Calendario', icon: '📅', route: '/calendar' },
  { label: 'Base de Conocimiento', icon: '📚', route: '/knowledge' },
  { label: 'Mensajes', icon: '💬', route: '/brain' },
]

export default function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { openTabs, activeTabId, setActiveTabId, addTab, closeTab } = useApp()
  const [showMenu, setShowMenu] = useState(false)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
  const initial = name?.charAt(0).toUpperCase() || '?'

  const handleAddTab = (category) => {
    const id = category.route.replace('/', '')
    addTab({
      id: id,
      label: category.label,
      icon: category.icon,
      route: category.route,
    })
    navigate(category.route)
    setShowMenu(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: `calc(var(--safe-top) + 12px) 16px 0`,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}
    >
      {/* Avatar + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px' }}>
        {/* Avatar */}
        <button
          onClick={() => navigate('/inicio')}
          style={{
            width: '32px',
            height: '32px',
            flexShrink: 0,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--gradient-brand)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initial}
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, overflowX: 'auto', paddingBottom: '4px' }}>
          {openTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id)
                navigate(tab.route)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTabId === tab.id ? 'var(--brand-dim)' : 'var(--bg-2)',
                color: activeTabId === tab.id ? 'var(--brand)' : 'var(--text-2)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </motion.button>
          ))}

          {/* Add Tab Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                padding: 0,
                borderRadius: '6px',
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-3)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.route}
                      onClick={() => handleAddTab(cat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-3)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
