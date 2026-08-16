import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useResponsive } from '@/shared/hooks/useResponsive'

/**
 * SidebarDrawer - Envuelve el Sidebar para hacerlo drawer en mÃ³vil
 * Desktop: Sidebar normal permanente
 * Tablet/MÃ³vil: Sidebar como drawer modal
 */

interface SidebarDrawerProps {
  children: ReactNode
  sidebarContent: ReactNode
  showToggleButton?: boolean
}

export function SidebarDrawer({
  children,
  sidebarContent,
  showToggleButton = true,
}: SidebarDrawerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  // Determinar si mostrar como drawer
  useEffect(() => {
    setShowDrawer(isMobile || isTablet)
    // Cerrar drawer cuando se cambia a desktop
    if (isDesktop && drawerOpen) {
      setDrawerOpen(false)
    }
  }, [isMobile, isTablet, isDesktop, drawerOpen])

  // Desktop: Sidebar siempre visible + contenido normal
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        <aside
          style={{
            width: 'var(--sidebar-width-expanded)',
            flexShrink: 0,
            borderRight: '1px solid var(--surface-2)',
            overflowY: 'auto',
          }}
        >
          {sidebarContent}
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    )
  }

  // Mobile/Tablet: Drawer + contenido + botÃ³n toggle
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      {/* Header con botÃ³n de menu */}
      {showToggleButton && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--layout-padding)',
            height: 'var(--topbar-height)',
            borderBottom: '1px solid var(--surface-2)',
            backgroundColor: 'var(--surface-0)',
          }}
        >
          <motion.button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 hover:bg-surface-1 rounded-lg transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-text-1" />
          </motion.button>
          <span className="text-sm font-semibold text-text-1 flex-1 ml-3">Menu</span>
        </div>
      )}

      {/* Main content area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </main>

      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              transition={{ duration: 0.2 }}
              style={{
                top: 'var(--topbar-height)',
              }}
            />

            {/* Drawer panel */}
            <motion.aside
              className="fixed left-0 bg-surface-0 shadow-xl z-40"
              style={{
                top: 'var(--topbar-height)',
                width: '280px',
                height: 'calc(100% - var(--topbar-height))',
                overflowY: 'auto',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button in drawer */}
              <div className="flex justify-end p-4 border-b border-surface-2">
                <motion.button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 hover:bg-surface-1 rounded-lg transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-text-2" />
                </motion.button>
              </div>

              {/* Sidebar content */}
              <div className="px-2 py-4">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * useSidebarDrawer - Hook para controlar el estado del drawer
 */

export function useSidebarDrawer() {
  const [open, setOpen] = useState(false)
  const { isDesktop } = useResponsive()

  // Auto-cerrar en desktop
  useEffect(() => {
    if (isDesktop) {
      setOpen(false)
    }
  }, [isDesktop])

  return {
    open,
    onOpen: () => !isDesktop && setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => !isDesktop && setOpen((prev) => !prev),
  }
}

