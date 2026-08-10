import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PanelLeft, Plus, FileText, Users, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * TopBar — Barra superior con estructura Notion-like
 * Izq: Menú hamburguesa + Flechas | Centro: Título/Breadcrumb | Der: Botón +
 */
export default function TopBar({ onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [showSettings, setShowSettings] = useState(false)

  // Mapeo de rutas a títulos
  const getTitleFromRoute = () => {
    const routeTitles = {
      '/': 'Inicio',
      '/clients': 'Clientes',
      '/projects': 'Proyectos',
      '/finance': 'Finanzas',
      '/invoices': 'Facturas',
      '/quotes': 'Cotizaciones',
      '/calendar': 'Calendario',
      '/knowledge': 'Biblioteca',
      '/brain': 'Asistente',
      '/time': 'Tiempo',
      '/inbox': 'Bandeja',
    }
    return routeTitles[location.pathname] || 'AKIRA'
  }

  const addMenuItems = [
    { label: 'Nuevo proyecto', icon: Briefcase, route: '/projects' },
    { label: 'Nuevo cliente', icon: Users, route: '/clients' },
    { label: 'Nuevo documento', icon: FileText, route: '/knowledge' },
  ]

  const handleAddClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    })
    setShowAddMenu(!showAddMenu)
  }

  return (
    <div style={{
      height: '56px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-3)',
      gap: 'var(--space-3)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 40,
    }}>
      {/* Left: Menu + Navigation Arrows */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexShrink: 0,
      }}>
        {/* Collapse Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Contraer/Expandir sidebar"
        >
          <PanelLeft size={20} />
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={() => window.history.back()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Atrás"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => window.history.forward()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Adelante"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Center: Título + Icono */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        minWidth: 0,
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          background: 'var(--brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}>
          📎
        </div>
        <span style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {getTitleFromRoute()}
        </span>
      </div>

      {/* Right: Add Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddClick}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Añadir"
        >
          <Plus size={20} />
        </motion.button>

        {/* Add Menu Dropdown */}
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              zIndex: 1000,
              minWidth: '200px',
              overflow: 'hidden',
            }}
            onMouseLeave={() => setShowAddMenu(false)}
          >
            {addMenuItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    navigate(item.route)
                    setShowAddMenu(false)
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-1)',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: idx < addMenuItems.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'all var(--dur-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
