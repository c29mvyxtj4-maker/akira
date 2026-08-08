import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Home, MessageCircle, Video, Inbox, Search } from 'lucide-react'
import { ROUTES } from '@/config/constants'

export default function Sidebar() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { icon: Home, label: 'Inicio', route: ROUTES.HOME },
    { icon: MessageCircle, label: 'Chat', route: '/brain' },
    { icon: Video, label: 'Reuniones', route: '/calendar' },
    { icon: Inbox, label: 'Bandeja', route: '/inbox' },
  ]

  return (
    <motion.div
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--surface-0)',
        borderRight: '1px solid var(--surface-2)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 8px',
        borderBottom: '1px solid var(--surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--surface-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-1)'
              e.currentTarget.style.color = 'var(--text-1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-2)'
            }}
            title="Atrás"
          >
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.forward()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--surface-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-1)'
              e.currentTarget.style.color = 'var(--text-1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-2)'
            }}
            title="Adelante"
          >
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </motion.button>
        </div>

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid var(--surface-2)',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            marginLeft: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title={isCollapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
        >
          <ChevronLeft style={{
            width: '18px',
            height: '18px',
            transform: isCollapsed ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 0.3s ease',
          }} />
        </motion.button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            padding: '12px 8px',
            borderBottom: '1px solid var(--surface-2)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--surface-2)',
            background: 'var(--surface-1)',
          }}>
            <Search style={{ width: '16px', height: '16px', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-1)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Navigation Items */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '12px 8px',
        overflowY: 'auto',
      }}>
        {navItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.route)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-1)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            {!isCollapsed && <span>{item.label}</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
