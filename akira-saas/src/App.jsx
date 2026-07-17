import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES }  from '@/config/constants'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

// Auth pages
import Login         from '@/pages/auth/Login'
import ResetPassword from '@/pages/auth/ResetPassword'

// Layout
import AppShell from '@/components/layout/AppShell'

// Components
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal'

// Pages
import Dashboard     from '@/pages/Dashboard'
import Clients       from '@/pages/Clients'
import Projects      from '@/pages/Projects'
import Services      from '@/pages/Services'
import Subscriptions from '@/pages/Subscriptions'
import Finance       from '@/pages/Finance'
import Invoices      from '@/pages/Invoices' // ← NUEVO
import Calendar      from '@/pages/Calendar'
import Knowledge     from '@/pages/Knowledge'
import Brain         from '@/pages/Brain'
import Settings      from '@/pages/Settings'
import PortalLogin     from '@/pages/portal/PortalLogin'
import PortalDashboard from '@/pages/portal/PortalDashboard'
import JoinOrg from '@/pages/JoinOrg'
import Quotes from '@/pages/Quotes'
import Offers from '@/pages/Offers'
import Documents from '@/pages/Documents'

function ComingSoon({ name }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-lg font-semibold text-text-1 mb-1">{name}</h2>
        <p className="text-text-4 text-sm">Módulo en construcción</p>
      </div>
    </div>
  )
}

function AppLoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-surface-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
          <span className="text-white font-black text-lg">A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
               style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
               style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
               style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-text-4 text-sm">Iniciando AKIRA…</span>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <AppLoadingScreen />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  return children
}

export default function App() {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '?',
      label: 'Show keyboard shortcuts',
      handler: () => setShowShortcutsHelp(true),
    },
  ])

  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.RESET} element={<ResetPassword />} />

        {/* Privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index                  element={<Dashboard />} />
          <Route path="clients/*"       element={<Clients />} />
          <Route path="projects/*"      element={<Projects />} />
          <Route path="services/*"      element={<Services />} />
          <Route path="subscriptions/*" element={<Subscriptions />} />
          <Route path="finance/*"       element={<Finance />} />
          <Route path="invoices/*"      element={<Invoices />} /> <Route path="quotes/*" element={<Quotes />} />
          <Route path="calendar/*"      element={<Calendar />} />
          <Route path="knowledge/*"     element={<Knowledge />} />
          <Route path="brain/*"         element={<Brain />} />
          <Route path="settings/*"      element={<Settings />} />
          <Route path="offers/*" element={<Offers />} />
          <Route path="documents/*" element={<Documents />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        {/* Portal de clientes — rutas públicas */}
        <Route path="/portal"           element={<PortalLogin />} />
        <Route path="/portal/dashboard" element={<PortalDashboard />} />
        <Route path="/join" element={<JoinOrg />} />
      </Routes>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </>
  )
}