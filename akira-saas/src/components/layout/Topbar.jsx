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
  }, [location.pathname, openTabs])

  const handleAddTab = (category) => {
    const existingTab = openTabs.find(t => t.route === category.route)
    if (existingTab) {
      setActiveTab(existingTab.id)
      navigate(category.route)
    } else {
      const newTab = { id: Math.random(), ...category }
      setOpenTabs(prev => [...prev, newTab])
      setActiveTab(newTab.id)
      navigate(category.route)
    }
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
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid var(--surface-2)',
      background: 'var(--surface-0)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(var(--surface-0-rgb), 0.95)',
    }}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/inicio')}
        style={{
          width: '40px',
          height: '40px',
          flexShrink: 0,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--brand-500)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(230, 57, 70, 0.2)',
        }}
      >
        {initial}
      </motion.button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflowX: 'auto', paddingRight: '8px' }}>
        {openTabs.map((tab) => (
          <motion.div
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab(tab.id)
              navigate(tab.route)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--brand-500)' : 'var(--surface-1)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-1)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
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
                padding: '2px 4px',
                borderRadius: '3px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </motion.div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            padding: 0,
            borderRadius: '8px',
            border: '1.5px dashed var(--surface-2)',
            background: 'var(--surface-1)',
            color: 'var(--text-2)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-2)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                background: 'var(--surface-0)',
                border: '1px solid var(--surface-2)',
                borderRadius: '12px',
                padding: '10px',
                minWidth: '200px',
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.route}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddTab(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-1)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-1)'
                    e.currentTarget.style.color = 'var(--brand-500)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-1)'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
