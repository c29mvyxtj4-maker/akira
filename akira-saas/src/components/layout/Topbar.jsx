import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = [
  { label: 'Clientes', icon: '👥', route: '/clients' },
  { label: 'Proyectos', icon: '📋', route: '/projects' },
  { label: 'Finanzas', icon: '💰', route: '/finance' },
  { label: 'Facturas', icon: '📄', route: '/invoices' },
  { label: 'Calendario', icon: '📅', route: '/calendar' },
  { label: 'Knowledge', icon: '📚', route: '/knowledge' },
  { label: 'Mensajes', icon: '💬', route: '/brain' },
  { label: 'YouTube', icon: '🎬', route: '/youtube' },
]

export default function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [openTabs, setOpenTabs] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
  const initial = name?.charAt(0).toUpperCase() || '?'

  // Actualizar tab activo cuando navega
  useEffect(() => {
    const currentPath = location.pathname
    const existingTab = openTabs.find(t => t.route === currentPath)

    if (!existingTab) {
      const category = CATEGORIES.find(c => c.route === currentPath)
      if (category) {
        const newTab = { id: Math.random(), ...category }
        setOpenTabs(prev => [...prev, newTab])
        setActiveTab(newTab.id)
      }
    } else {
      setActiveTab(existingTab.id)
    }
  }, [location.pathname])

  const handleAddTab = (category) => {
    const existingTab = openTabs.find(t => t.route === category.route)
    if (existingTab) {
      setActiveTab(existingTab.id)
    } else {
      const newTab = { id: Math.random(), ...category }
      setOpenTabs(prev => [...prev, newTab])
      setActiveTab(newTab.id)
    }
    navigate(category.route)
    setShowMenu(false)
  }

  const handleCloseTab = (tabId) => {
    const newTabs = openTabs.filter(t => t.id !== tabId)
    setOpenTabs(newTabs)

    if (activeTab === tabId) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id)
        navigate(newTabs[newTabs.length - 1].route)
      } else {
        navigate('/inicio')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: `calc(var(--safe-top) + 12px) 16px 12px`,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, overflowX: 'auto' }}>
        {openTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              navigate(tab.route)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--brand-dim)' : 'var(--bg-2)',
              color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-2)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTab(tab.id)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </motion.button>
        ))}
      </div>

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
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '180px',
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
    </motion.div>
  )
}
