import { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * ResponsiveLayout - Contenedor principal que adapta layout según breakpoint
 * Desktop: Sidebar + Topbar + Content
 * Tablet: Sidebar compacto + Topbar + Content + BottomNav
 * Móvil: Drawer + Topbar + Content + BottomNav
 */

interface ResponsiveLayoutProps {
  children: ReactNode
  sidebarOpen?: boolean
  onSidebarClose?: () => void
  showBottomNav?: boolean
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebarOpen = false,
  onSidebarClose,
  showBottomNav = true,
  className = '',
}: ResponsiveLayoutProps) {
  return (
    <div className={`responsive-layout ${className}`}>
      {/* Main content - adapts to available space */}
      <main
        className="main-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {children}
      </main>

      {/* Sidebar overlay backdrop (mobile only) */}
      {sidebarOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSidebarClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
        />
      )}
    </div>
  )
}
