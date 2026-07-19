import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider }  from './context/AppContext.jsx'
import { OrgProvider }  from './context/OrgContext.jsx'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './lib/sentry'   // inicializa Sentry si hay VITE_SENTRY_DSN (no-op si no)
import './index.css'

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