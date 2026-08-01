import { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES }  from '@/config/constants'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

// Auth pages — eager so the login screen paints instantly on first load
import Login         from '@/pages/auth/Login'
import ResetPassword from '@/pages/auth/ResetPassword'

// Layout
import AppShell from '@/components/layout/AppShell'

// Components
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal'

// Pages — lazy-loaded so each route ships its own chunk (keeps the initial bundle small)
const Dashboard     = lazy(() => import('@/pages/Dashboard'))
const Clients       = lazy(() => import('@/pages/Clients'))
const Projects      = lazy(() => import('@/pages/Projects'))
const Services      = lazy(() => import('@/pages/Services'))
const Subscriptions = lazy(() => import('@/pages/Subscriptions'))
const Finance       = lazy(() => import('@/pages/Finance'))
const Invoices      = lazy(() => import('@/pages/Invoices'))
const Calendar      = lazy(() => import('@/pages/Calendar'))
const Knowledge     = lazy(() => import('@/pages/Knowledge'))
const Brain         = lazy(() => import('@/pages/Brain'))
const Settings      = lazy(() => import('@/pages/Settings'))
const PortalLogin     = lazy(() => import('@/pages/portal/PortalLogin'))
const PortalDashboard = lazy(() => import('@/pages/portal/PortalDashboard'))
const JoinOrg       = lazy(() => import('@/pages/JoinOrg'))
const Legal         = lazy(() => import('@/pages/Legal'))
const Quotes        = lazy(() => import('@/pages/Quotes'))
const Offers        = lazy(() => import('@/pages/Offers'))
const Documents     = lazy(() => import('@/pages/Documents'))
const TimeTracking  = lazy(() => import('@/pages/TimeTracking'))
const AIOperatives  = lazy(() => import('@/pages/AIOperatives'))
const Inicio        = lazy(() => import('@/pages/Inicio')) // PRUEBA: home experimental
const Mensajes      = lazy(() => import('@/pages/Mensajes'))
const InboxPage     = lazy(() => import('@/pages/InboxPage'))

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
        <img src="/icons/icon.svg" alt="AKIRA" className="w-10 h-10 rounded-xl" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 akira-loader-dot"
               style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 akira-loader-dot"
               style={{ animationDelay: '160ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 akira-loader-dot"
               style={{ animationDelay: '320ms' }} />
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
      <Suspense fallback={<AppLoadingScreen />}>
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
          {/* Inicio es ahora la pantalla principal */}
          <Route index                  element={<Navigate to="/inicio" replace />} />
          <Route path="inicio"          element={<Inicio />} />
          <Route path="mensajes"        element={<Mensajes />} />
          <Route path="inbox"           element={<InboxPage />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="clients/*"       element={<Clients />} />
          <Route path="projects/*"      element={<Projects />} />
          <Route path="services/*"      element={<Services />} />
          <Route path="subscriptions/*" element={<Subscriptions />} />
          <Route path="finance/*"       element={<Finance />} />
          {/* Facturas + Presupuestos unificados en commercial_documents (Documents).
             Las rutas antiguas redirigen aquí. */}
          <Route path="invoices/*"      element={<Documents />} />
          <Route path="documents/*"     element={<Navigate to="/invoices" replace />} />
          <Route path="quotes/*"        element={<Navigate to="/invoices" replace />} />
          <Route path="time/*"          element={<TimeTracking />} />
          <Route path="operatives/*"    element={<AIOperatives />} />
          <Route path="calendar/*"      element={<Calendar />} />
          <Route path="knowledge/*"     element={<Knowledge />} />
          <Route path="brain/*"         element={<Brain />} />
          <Route path="settings/*"      element={<Settings />} />
          <Route path="offers/*"        element={<Offers />} />
        </Route>

        {/* Portal de clientes — rutas públicas */}
        <Route path="/portal"           element={<PortalLogin />} />
        <Route path="/portal/dashboard" element={<PortalDashboard />} />
        <Route path="/join" element={<JoinOrg />} />
        <Route path="/legal" element={<Legal />} />

        {/* Catch-all al final para no interceptar las rutas públicas de arriba */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </>
  )
}