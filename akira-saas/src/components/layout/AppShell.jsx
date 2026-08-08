import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import TopMenu from './TopMenu'
import Sidebar from './Sidebar'
import InstallBanner from '@/components/pwa/InstallBanner'
import { PageSpinner } from '@/components/ui/Spinner'
import { useApp } from '@/context/AppContext'
import { DUR, EASE } from '@/config/motion'

export default function AppShell() {
  var { toasts, removeToast } = useApp()
  var location = useLocation()
  var isInicio = location.pathname === '/inicio'

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="bg-glow" />

      {/* TopMenu - solo en páginas que no sean /inicio */}
      {!isInicio && <TopMenu />}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - solo en páginas que no sean /inicio */}
        {!isInicio && <Sidebar />}

        {/* Main Content */}
        <main className="app-main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Topbar (tabs) - solo en páginas que no sean /inicio */}
          {!isInicio && <Topbar />}

          <motion.div
            key={location.pathname.split('/')[1] || 'home'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.page, ease: EASE.out }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}
          >
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      <BottomBar />

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '96px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {toasts && toasts.map(function(toast) {
            var colors = {
              success: { border: 'rgba(34,197,94,0.3)',  color: '#22c55e' },
              error:   { border: 'var(--brand-border)',   color: '#e63946' },
              warning: { border: 'rgba(245,158,11,0.3)',  color: '#f59e0b' },
              info:    { border: 'rgba(59,130,246,0.3)',  color: '#3b82f6' },
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
                  background: 'var(--bg-2)', border: '1px solid ' + c.border,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)', fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', maxWidth: '320px', backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, boxShadow: '0 0 6px ' + c.color, flexShrink: 0 }} />
                {toast.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <InstallBanner />
    </div>
  )
}
