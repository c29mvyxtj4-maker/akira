import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar       from './Sidebar'
import Topbar        from './Topbar'
import CommandPalette from './CommandPalette'
import InstallBanner from '@/components/pwa/InstallBanner'
import { PageSpinner } from '@/components/ui/Spinner'
import { useApp } from '@/context/AppContext'

export default function AppShell() {
  var { toasts, removeToast } = useApp()
  var location = useLocation()

  var [collapsed, setCollapsed]   = useState(false)
  var [mobileOpen, setMobileOpen] = useState(false)
  var [searchOpen, setSearchOpen] = useState(false) // NUEVO

  useEffect(function() {
    document.documentElement.className = ''
    localStorage.removeItem('akira-theme')
  }, [])

  useEffect(function() {
    setMobileOpen(false)
  }, [location.pathname])

  // Atajo de teclado global: Cmd+K (Mac) o Ctrl+K (Windows) — NUEVO
  useEffect(function() {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(function(v) { return !v })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return function() { window.removeEventListener('keydown', onKeyDown) }
  }, [])

  return (
    <div className="app-shell">
      {/* Glow ambiental */}
      <div className="bg-glow" />

      {/* Topbar */}
      <Topbar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileToggle={function() { setMobileOpen(function(v) { return !v }) }}
        onSearchClick={function() { setSearchOpen(true) }}
      />

      {/* Body */}
      <div className="app-body">
        <Sidebar
          collapsed={collapsed}
          onToggle={function() { setCollapsed(function(v) { return !v }) }}
          mobileOpen={mobileOpen}
        />

        {/* Fondo oscuro al abrir el menú en móvil — al tocarlo, se cierra */}
        {mobileOpen && (
          <div
            className="sidebar-overlay"
            onClick={function() { setMobileOpen(false) }}
          />
        )}

        {/* Contenido principal */}
        <main className="app-main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Transición de entrada por sección — se remonta solo al cambiar de sección,
              no en la navegación interna (p. ej. abrir un cliente) para no perder estado */}
          <motion.div
            key={location.pathname.split('/')[1] || 'home'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      {/* Buscador global — NUEVO */}
      <AnimatePresence>
        {searchOpen && (
          <CommandPalette open={searchOpen} onClose={function() { setSearchOpen(false) }} />
        )}
      </AnimatePresence>

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {toasts && toasts.map(function(toast) {
            var colors = {
              success: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#22c55e' },
              error:   { bg: 'rgba(230,57,70,0.12)',  border: 'rgba(230,57,70,0.3)',  color: '#e63946' },
              warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
              info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6' },
            }
            var c = colors[toast.type] || colors.info
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={function() { removeToast(toast.id) }}
                style={{
                  padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-2)',
                  border: '1px solid ' + c.border,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-1)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', maxWidth: '320px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, boxShadow: '0 0 6px ' + c.color, flexShrink: 0 }} />
                {toast.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Banner de instalación PWA */}
      <InstallBanner />
    </div>
  )
}