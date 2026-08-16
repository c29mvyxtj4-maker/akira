import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Database, Receipt, History, Building2, SlidersHorizontal,
  Users2, Tag, Bell, AlertOctagon, Download, FileText, Workflow,
  Sparkles, Plug, Globe, Terminal, WifiOff, Boxes, Fingerprint, Scale,
  ChevronRight, ChevronLeft, X,
} from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import PageHeader from '@/shared/components/layout/PageHeader'
import ProfileTab from '@/components/settings/ProfileTab'
import PreferencesTab from '@/components/settings/PreferencesTab'
import WorkspaceTab from '@/components/settings/WorkspaceTab'
import BillingTab from '@/components/settings/BillingTab'
import CategoriesTab from '@/components/settings/CategoriesTab'
import TemplatesTab from '@/components/settings/TemplatesTab'
import NotificationsTab from '@/components/settings/NotificationsTab'
import DataExportTab from '@/components/settings/DataExportTab'
import AuditTab from '@/components/settings/AuditTab'
import TeamTab from '@/components/settings/TeamTab'
import DangerZoneTab from '@/components/settings/DangerZoneTab'
import SecurityTab from '@/components/settings/SecurityTab'
import AccountTab from '@/components/settings/AccountTab'
import AutomationsTab from '@/components/settings/AutomationsTab'
import AITab from '@/components/settings/AITab'
import ConnectionsTab from '@/components/settings/ConnectionsTab'
import PublicPagesTab from '@/components/settings/PublicPagesTab'
import MCPTab from '@/components/settings/MCPTab'
import OfflineTab from '@/components/settings/OfflineTab'
import TeamspaceTab from '@/components/settings/TeamspaceTab'
import IdentityTab from '@/components/settings/IdentityTab'
import LegalTab from '@/components/settings/LegalTab'

export default function Settings({ onClose, initialTab }) {
  var { user, signOut } = useAuth()
  var isModal = typeof onClose === 'function'
  var [activeTab, setActiveTab] = useState(initialTab || 'profile')

  // MÃ³vil: 'list' (ver las pestaÃ±as) | 'content' (ver el contenido de una pestaÃ±a) â€” NUEVO
  var [mobileStep, setMobileStep] = useState('list')
  var [isMobile, setIsMobile] = useState(false)
  useEffect(function() {
    var mq = window.matchMedia('(max-width: 768px)')
    function update() { setIsMobile(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return function() { mq.removeEventListener('change', update) }
  }, [])

  function selectTab(id) {
    setActiveTab(id)
    setMobileStep('content')
  }

  // Estructura por grupos (estilo Notion): cada grupo tiene un encabezado y sus
  // pestaÃ±as. El mapa plano TABS se deriva para bÃºsquedas por id.
  var GROUPS = [
    { title: 'Cuenta', tabs: [
      { id: 'profile',       label: 'Mi perfil',       icon: User },
      { id: 'preferences',   label: 'Preferencias',    icon: SlidersHorizontal },
      { id: 'notifications', label: 'Notificaciones',  icon: Bell },
      { id: 'account',       label: 'Cuenta y sesiÃ³n', icon: Database },
      { id: 'legal',         label: 'Legal',           icon: Scale },
    ] },
    { title: 'Espacio de trabajo', tabs: [
      { id: 'workspace',   label: 'General',    icon: Building2 },
      { id: 'team',        label: 'Personas',   icon: Users2 },
      { id: 'data',        label: 'Importar',   icon: Download },
      { id: 'categories',  label: 'CategorÃ­as', icon: Tag },
      { id: 'templates',   label: 'Plantillas', icon: FileText },
    ] },
    { title: 'Funciones', tabs: [
      { id: 'ai',          label: 'IA de AKIRA',      icon: Sparkles },
      { id: 'connections', label: 'Conexiones',       icon: Plug },
      { id: 'mcp',         label: 'MCP de AKIRA',     icon: Terminal },
      { id: 'offline',     label: 'Sin conexiÃ³n',     icon: WifiOff },
      { id: 'publicpages', label: 'PÃ¡ginas pÃºblicas', icon: Globe },
      { id: 'automations', label: 'Automatizaciones', icon: Workflow },
    ] },
    { title: 'AdministraciÃ³n', tabs: [
      { id: 'teamspace', label: 'Espacio de equipo', icon: Boxes },
      { id: 'security',  label: 'Seguridad',         icon: Lock },
      { id: 'identity',  label: 'Identidad',         icon: Fingerprint },
      { id: 'audit',     label: 'AuditorÃ­a',         icon: History },
      { id: 'danger',    label: 'Zona de peligro',   icon: AlertOctagon },
    ] },
    { title: 'Acceso y facturaciÃ³n', tabs: [
      { id: 'billing', label: 'Plan y facturaciÃ³n', icon: Receipt },
    ] },
  ]

  var TABS = GROUPS.reduce(function(acc, g) { return acc.concat(g.tabs) }, [])
  var activeTabInfo = TABS.find(function(t) { return t.id === activeTab })
  var initial = (user && (user.user_metadata && user.user_metadata.full_name || user.email) || 'A').trim().charAt(0).toUpperCase()
  var showListPane    = !isMobile || mobileStep === 'list'
  var showContentPane = !isMobile || mobileStep === 'content'

  var twoPane = (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar de tabs, agrupada estilo Notion â€” en mÃ³vil, pantalla completa hasta elegir */}
        {showListPane && (
          <div style={{ width: isMobile ? '100%' : '248px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '14px 10px', background: 'rgba(255,255,255,0.012)', overflowY: 'auto' }}>
            {GROUPS.map(function(group, gi) {
              return (
                <div key={group.title} style={{ marginBottom: '10px', marginTop: gi === 0 ? 0 : '6px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--text-5)', padding: '6px 12px 4px' }}>{group.title}</p>
                  {group.tabs.map(function(tab) {
                    var Icon   = tab.icon
                    var active = activeTab === tab.id
                    var isProfile = tab.id === 'profile'
                    return (
                      <button key={tab.id} type="button" onClick={function() { selectTab(tab.id) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                          padding: '8px 12px', borderRadius: '8px', border: 'none',
                          background: active && !isMobile ? 'var(--brand-dim)' : 'transparent',
                          color: active && !isMobile ? 'var(--brand)' : 'var(--text-3)',
                          fontSize: '13px', fontWeight: active && !isMobile ? 600 : 500,
                          cursor: 'pointer', marginBottom: '1px', textAlign: 'left',
                          transition: 'background 0.1s, color 0.1s',
                        }}
                        onMouseEnter={function(e) { if (!(active && !isMobile)) e.currentTarget.style.background = 'var(--bg-3)' }}
                        onMouseLeave={function(e) { if (!(active && !isMobile)) e.currentTarget.style.background = 'transparent' }}
                      >
                        {isProfile ? (
                          <span style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, background: 'var(--gradient-brand)', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initial}</span>
                        ) : (
                          <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        )}
                        {tab.label}
                        <ChevronRight style={{ width: '13px', height: '13px', marginLeft: 'auto', opacity: isMobile ? 0.4 : (active ? 0.9 : 0) }} />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* Contenido */}
        {showContentPane && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 20px' : '28px 36px' }}>
            <div style={{ maxWidth: '680px' }}>

              {/* BotÃ³n volver, solo en mÃ³vil */}
              {isMobile && (
                <button
                  type="button"
                  onClick={function() { setMobileStep('list') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '18px' }}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} />
                  {activeTabInfo ? activeTabInfo.label : 'Volver'}
                </button>
              )}

              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ProfileTab user={user} />
                  </motion.div>
                )}
                {activeTab === 'preferences' && (
                  <motion.div key="preferences" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <PreferencesTab />
                  </motion.div>
                )}
                {activeTab === 'workspace' && (
                  <motion.div key="workspace" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <WorkspaceTab />
                  </motion.div>
                )}
                {activeTab === 'ai' && (
                  <motion.div key="ai" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <AITab />
                  </motion.div>
                )}
                {activeTab === 'connections' && (
                  <motion.div key="connections" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ConnectionsTab />
                  </motion.div>
                )}
                {activeTab === 'publicpages' && (
                  <motion.div key="publicpages" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <PublicPagesTab />
                  </motion.div>
                )}
                {activeTab === 'billing' && (
                  <motion.div key="billing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <BillingTab />
                  </motion.div>
                )}
                {activeTab === 'categories' && (
                  <motion.div key="categories" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <CategoriesTab />
                  </motion.div>
                )}
                {activeTab === 'templates' && (
                  <motion.div key="templates" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <TemplatesTab />
                  </motion.div>
                )}
                {activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <NotificationsTab />
                  </motion.div>
                )}
                {activeTab === 'data' && (
                  <motion.div key="data" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <DataExportTab />
                  </motion.div>
                )}
                {activeTab === 'audit' && (
                  <motion.div key="audit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <AuditTab />
                  </motion.div>
                )}
                {activeTab === 'team' && (
                  <motion.div key="team" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <TeamTab />
                  </motion.div>
                )}
                {activeTab === 'danger' && (
                  <motion.div key="danger" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <DangerZoneTab />
                  </motion.div>
                )}
                {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <SecurityTab />
                  </motion.div>
                )}
                {activeTab === 'account' && (
                  <motion.div key="account" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <AccountTab user={user} onSignOut={signOut} />
                  </motion.div>
                )}
                {activeTab === 'automations' && (
                  <motion.div key="automations" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                   <AutomationsTab />
                 </motion.div>
                )}
                {activeTab === 'legal' && (
                  <motion.div key="legal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <LegalTab />
                  </motion.div>
                )}
                {activeTab === 'mcp' && (
                  <motion.div key="mcp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MCPTab />
                  </motion.div>
                )}
                {activeTab === 'offline' && (
                  <motion.div key="offline" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <OfflineTab />
                  </motion.div>
                )}
                {activeTab === 'teamspace' && (
                  <motion.div key="teamspace" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <TeamspaceTab />
                  </motion.div>
                )}
                {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <IdentityTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
  )

  if (isModal) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          onClick={function(e) { e.stopPropagation() }}
          style={{ width: 'min(96vw, 1000px)', height: 'min(88dvh, 760px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-1)' }}>ConfiguraciÃ³n</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar" style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'var(--bg-3)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          {twoPane}
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Configuracion"
        description="Gestiona tu perfil, workspace y preferencias"
      />
      {twoPane}
    </div>
  )
}

