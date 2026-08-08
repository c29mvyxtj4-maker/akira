import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider }  from './context/AppContext.jsx'
import { OrgProvider }  from './context/OrgContext.jsx'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { installPrefsListener } from './lib/applyPrefs'
import './lib/sentry'   // inicializa Sentry si hay VITE_SENTRY_DSN (no-op si no)
import './index.css'

// Aplica tema / contraste / reducir-movimiento desde el arranque y reacciona a
// cambios de preferencias, para que sean globales (no solo en el modal Ajustes).
installPrefsListener()

// Anti-caché: un build antiguo con vite-plugin-pwa dejaba un service worker que
// congelaba la app en versiones viejas (sobre todo en PWA de iOS). Ya no usamos
// SW de caché, así que al arrancar desregistramos cualquier SW y borramos todas
// las cachés — la app carga siempre de red.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(function (rs) { rs.forEach(function (r) { r.unregister() }) })
    .catch(function () {})
}
if (typeof caches !== 'undefined' && caches.keys) {
  caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k) }) }).catch(function () {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <OrgProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  </ErrorBoundary>
)