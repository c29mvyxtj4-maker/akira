import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import SettingsPanel from '@/pages/Settings'

/**
 * AppLayout — Contenedor principal del sistema modular.
 * Estructura: Sidebar (izq) + TopBar + Main (Header + Tabs + Toolbar + Content)
 *
 * Props:
 *   header: <PageHeader /> element
 *   tabs: <PageTabs /> element (opcional)
 *   toolbar: <PageToolbar /> element (opcional)
 *   children: <PageContent> con contenido de la página
 *   sidebar: <Sidebar /> (puede ser customizado)
 */
export default function AppLayout({
  header,
  tabs,
  toolbar,
  children,
  sidebar: customSidebar,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }
  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      width: '100%',
      background: 'var(--bg-base)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sidebar izquierda */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* TopBar */}
        <div style={{ flexShrink: 0 }}>
          <TopBar onToggleSidebar={handleToggleSidebar} />
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Header sticky */}
          {header && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                flexShrink: 0,
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-1)',
                position: 'sticky',
                top: 0,
                zIndex: 30,
              }}
            >
              {header}
            </motion.div>
          )}

          {/* Tabs (si existen) */}
          {tabs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              style={{
                flexShrink: 0,
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-1)',
                position: 'sticky',
                top: header ? 'auto' : 0,
                zIndex: 29,
              }}
            >
              {tabs}
            </motion.div>
          )}

          {/* Toolbar (si existe) */}
          {toolbar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              style={{
                flexShrink: 0,
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-1)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              {toolbar}
            </motion.div>
          )}

          {/* Contenido scrollable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              flex: 1,
              overflow: 'auto',
              position: 'relative',
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} initialTab="profile" />}
    </div>
  )
}
