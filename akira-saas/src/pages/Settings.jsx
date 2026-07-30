import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Database, Receipt, History,
  Users2, Tag, Bell, AlertOctagon, Download, FileText, Workflow,
  ChevronRight, ChevronLeft, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import PageHeader from '@/components/layout/PageHeader'
import ProfileTab from '@/components/settings/ProfileTab'
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

export default function Settings({ onClose, initialTab }) {
  var { user, signOut } = useAuth()
  var isModal = typeof onClose === 'function'
  var [activeTab, setActiveTab] = useState(initialTab || 'profile')

  // Móvil: 'list' (ver las pestañas) | 'content' (ver el contenido de una pestaña) — NUEVO
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

  var TABS = [
    { id: 'profile',       label: 'Perfil y espacio', icon: User },
    { id: 'billing',       label: 'Facturacion',     icon: Receipt },
    { id: 'categories',    label: 'Categorias',      icon: Tag },
    { id: 'templates',     label: 'Plantillas',      icon: FileText },
    { id: 'notifications', label: 'Notificaciones',  icon: Bell },
    { id: 'data',          label: 'Exportar datos',  icon: Download },
    { id: 'audit',         label: 'Auditoria',       icon: History },
    { id: 'team',          label: 'Equipo',          icon: Users2 },
    { id: 'danger',        label: 'Zona de peligro', icon: AlertOctagon },
    { id: 'security',      label: 'Seguridad',       icon: Lock },
    { id: 'account',       label: 'Cuenta',          icon: Database },
    { id: 'automations', label: 'Automatizaciones', icon: Workflow },
  ]

  var activeTabInfo = TABS.find(function(t) { return t.id === activeTab })
  var showListPane    = !isMobile || mobileStep === 'list'
  var showContentPane = !isMobile || mobileStep === 'content'

  var twoPane = (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar de tabs — en móvil, pantalla completa hasta que se elige una */}
        {showListPane && (
          <div style={{ width: isMobile ? '100%' : '220px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '16px 10px', background: 'rgba(255,255,255,0.01)', overflowY: 'auto' }}>
            {TABS.map(function(tab) {
              var Icon   = tab.icon
              var active = activeTab === tab.id
              return (
                <button key={tab.id} type="button" onClick={function() { selectTab(tab.id) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none',
                    background: active && !isMobile ? 'rgba(230,57,70,0.1)' : 'transparent',
                    color: active && !isMobile ? 'var(--brand)' : 'var(--text-4)',
                    fontSize: '13px', fontWeight: active && !isMobile ? 600 : 400,
                    cursor: 'pointer', marginBottom: '2px', textAlign: 'left',
                    transition: 'all 0.1s',
                    borderLeft: active && !isMobile ? '2px solid var(--brand)' : '2px solid transparent',
                  }}
                  onMouseEnter={function(e) { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={function(e) { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  {tab.label}
                  <ChevronRight style={{ width: '13px', height: '13px', marginLeft: 'auto', opacity: isMobile ? 0.4 : (active ? 1 : 0) }} />
                </button>
              )
            })}
          </div>
        )}

        {/* Contenido */}
        {showContentPane && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 20px' : '28px 36px' }}>
            <div style={{ maxWidth: '680px' }}>

              {/* Botón volver, solo en móvil */}
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
                    <WorkspaceTab />
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
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-1)' }}>Configuración</h2>
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