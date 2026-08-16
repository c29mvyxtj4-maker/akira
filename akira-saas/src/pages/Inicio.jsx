import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, MessageSquare, Calendar as CalendarIcon, Inbox, LayoutDashboard,
  Users, FolderKanban, Wallet, FileText, Clock, BookOpen,
  ChevronRight, TrendingUp, Search, Mail, Bell, Video,
} from 'lucide-react'
import { WidgetGrid, useWidgets } from '@/modules/widgets'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import { useOrg } from '@/shared/context/OrgContext'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { ROUTES } from '@/shared/config/constants'
import { DUR, EASE, SPRING } from '@/shared/config/motion'
import { getUnreadMentionCount } from '@/services/mentions.service'
import { getFinanceKpis } from '@/services/finance.service'
import { getPref } from '@/shared/hooks/usePreferences'
import TransparentArea from '@/shared/components/charts/TransparentArea'
import { fmtEuro, numberLocale } from '@/shared/lib/format'

function fmtEur(n) {
  return fmtEuro(n)
}
import AccountMenu from '@/shared/components/layout/AccountMenu'
import BorderGlow from '@/shared/components/ui/BorderGlow'
import SearchModal from '@/shared/components/ui/SearchModal'
import SettingsPanel from '@/pages/Settings'

// Props de BorderGlow afinados para botones pequeños del top bar (tono de marca).
var GLOW = { className: 'glow-btn', borderRadius: 19, glowRadius: 15, glowIntensity: 1.4, coneSpread: 25, backgroundColor: 'transparent', glowColor: '355 78 62', colors: ['#e63946', '#ff5a66', '#a01f2b'], animated: true }

// Fondo animado (three.js) –” en diferido para no bloquear la carga inicial.
var Silk = lazy(function () { return import('@/shared/components/effects/Silk') })

/*
 * Pantalla principal (hub). Sin sidebar: la navegación es esta pantalla + la
 * barra inferior global. Layout ancho para escritorio, rejillas responsive.
 */

function fmtCur(n, currency) {
  if (!n && n !== 0) return '--'
  return Number(n).toLocaleString(numberLocale(), { maximumFractionDigits: 0 }) + currency
}

export default function Inicio() {
  var navigate = useNavigate()
  var { kpis, loading } = useApp()
  var { profile, user, signOut } = useAuth()
  var { org, members, workspaces, switchWorkspace, createWorkspace } = useOrg()
  var { t, getCurrency } = useLanguage()
  var name = profile && profile.full_name ? profile.full_name.split(' ')[0] : 'usuario'
  var initial = profile && profile.full_name ? profile.full_name[0].toUpperCase() : 'M'

  var [unread, setUnread] = useState(0)
  var [fin, setFin] = useState({
    monthIncome: 0,
    incomeTrend: 0,
    sparkline: [
      { name: 'ene', value: 2400 },
      { name: 'feb', value: 1398 },
      { name: 'mar', value: 9800 },
      { name: 'abr', value: 3908 },
      { name: 'may', value: 4800 },
      { name: 'jun', value: 3800 },
    ]
  })
  var [menuOpen, setMenuOpen] = useState(false)
  var [menuAnchor, setMenuAnchor] = useState(null)
  var [settingsOpen, setSettingsOpen] = useState(false)
  var [settingsTab, setSettingsTab] = useState('profile')
  var [showWidgets, setShowWidgets] = useState(false)
  var [searchOpen, setSearchOpen] = useState(false)
  var { dashboard, addWidget, removeWidget, updateWidget, reorderWidgets, saveDashboard } = useWidgets()
  useEffect(function () { getUnreadMentionCount().then(setUnread).catch(function () {}) }, [])
  useEffect(function () { getFinanceKpis().then(setFin).catch(function () {}) }, [])

  function openSettings(t) { setMenuOpen(false); setSettingsTab(t || 'profile'); setSettingsOpen(true) }
  function openMenu(e) {
    var r = e.currentTarget.getBoundingClientRect()
    setMenuAnchor({ top: r.bottom + 6, left: r.left })
    setMenuOpen(function (v) { return !v })
  }
  function handleCreateWorkspace() {
    setMenuOpen(false)
    var name = window.prompt('Nombre del nuevo espacio de trabajo')
    if (name && name.trim()) createWorkspace(name.trim()).catch(function (e) { window.alert('No se pudo crear: ' + (e.message || e)) })
  }

  var PILLS = [
    { icon: Mail,          label: t('messages'),   to: '/mensajes' },
    { icon: Bell,          label: t('mentions'),  to: '/inbox' },
    { icon: Video,         label: t('meetings'),  to: '/calendar' },
  ]

  var currency = getCurrency()
  var KPIS = [
    { label: 'MRR',              value: loading ? '–' : fmtCur(kpis && kpis.mrr, currency),          icon: TrendingUp },
    { label: t('activeClients'), value: loading ? '–' : (kpis ? kpis.activeClients : 0),   icon: Users },
    { label: t('projects'),        value: loading ? '–' : (kpis ? kpis.activeProjects : 0),  icon: FolderKanban },
    { label: t('monthIncome'),     value: loading ? '–' : fmtCur(kpis && kpis.monthIncome, currency),  icon: Wallet },
  ]

  var QUICK = [
    { label: t('commandCenter'), sub: t('commandCenterSub'), icon: LayoutDashboard, to: '/dashboard' },
    { label: t('clients'),   sub: t('clientsSub'),   icon: Users,        to: ROUTES.CLIENTS },
    { label: t('projects'),  sub: t('projectsSub'),  icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: t('finances'),   sub: t('financesSub'),  icon: Wallet,       to: ROUTES.FINANCE },
    { label: t('invoices'),   sub: t('invoicesSub'),       icon: FileText,     to: ROUTES.INVOICES },
    { label: t('calendar'), sub: t('calendarSub'),   icon: CalendarIcon, to: ROUTES.CALENDAR },
    { label: t('documents'), sub: t('documentsSub'), icon: BookOpen,     to: ROUTES.DOCUMENTS },
  ]

  var SECTIONS = [
    { label: t('commandCenter'),      icon: LayoutDashboard, to: '/dashboard' },
    { label: t('clients'),             icon: Users,        to: ROUTES.CLIENTS },
    { label: t('projects'),            icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: t('finances'),             icon: Wallet,       to: ROUTES.FINANCE },
    { label: t('invoices'),             icon: FileText,     to: ROUTES.INVOICES },
    { label: t('timeTracking'),        icon: Clock,        to: ROUTES.TIME_TRACKING },
    { label: t('calendar'),           icon: CalendarIcon, to: ROUTES.CALENDAR },
    { label: t('documents'),           icon: BookOpen,     to: ROUTES.DOCUMENTS },
    { label: t('knowledgeBase'), icon: BookOpen,     to: ROUTES.KNOWLEDGE },
  ]

  var sectionLabel = { fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '28px 0 12px' }
  var noReduce = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var silkOn = noReduce && getPref('pref_bg_animation', true) !== false && getPref('pref_reduce_motion', false) !== true

  function handleSearch() {
    setSearchOpen(true)
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleAddAccount() {
    window.alert('Sistema de mÀºltiples cuentas - pronto disponible')
    setMenuOpen(false)
  }

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {silkOn && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Suspense fallback={null}>
            <Silk speed={5} scale={1} color="#340d0d" noiseIntensity={1.5} rotation={0} />
          </Suspense>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.58) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', overflowY: 'auto', paddingTop: 'calc(var(--safe-top) + 18px)' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px calc(112px + var(--safe-bottom))' }}>

        {/* Tu negocio de un vistazo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '28px' }}
        >
          <p style={{ fontSize: '14px', color: 'var(--text-4)', marginTop: '2px' }}>{t('yourBusiness')}</p>
        </motion.div>

        {/* Navigation Bar - Avatar, Search, Pills */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          {/* Avatar Button - Square Red */}
          <button
            onClick={openMenu}
            style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#e63946', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', transition: 'all 0.2s ease', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            title={user?.email}
          >
            {initial}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', background: 'var(--surface-2)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
            title="Buscar (Ctrl+K)"
          >
            <Search style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Icon Pills */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {PILLS.map(function(pill) {
              var Icon = pill.icon
              return (
                <motion.button
                  key={pill.label}
                  onClick={() => navigate(pill.to)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={pill.label}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--surface-2)',
                    color: 'var(--text-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-3)'
                    e.currentTarget.style.color = 'var(--text-1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface-2)'
                    e.currentTarget.style.color = 'var(--text-2)'
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ marginTop: '20px' }}>
          {KPIS.map(function(k, i) {
            var Icon = k.icon
            return (
              <motion.div key={k.label}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: DUR.slow, ease: EASE.out }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--brand)', opacity: 0.5 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '14px', height: '14px', color: 'var(--brand)' }} />
                  </div>
                </div>
                <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{k.value}</span>
              </motion.div>
            )
          })}
        </div>

        {/* Resumen financiero –” gráfica transparente (datos del workspace activo) */}
        {fin && fin.sparkline && (
          <>
            <p style={sectionLabel}>Resumen financiero</p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.slow, ease: EASE.out }}
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-4)' }}>Ingresos este mes</p>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                    {fmtEur(fin.monthIncome)}
                    {fin.incomeTrend !== null && fin.incomeTrend !== undefined && (
                      <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '8px', color: fin.incomeTrend >= 0 ? '#22c55e' : 'var(--brand)' }}>
                        {fin.incomeTrend >= 0 ? '––²' : '––¼'} {Math.abs(fin.incomeTrend)}%
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-4)' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--brand)' }} /> Ingresos
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-4)' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#64748b' }} /> Gastos
                  </span>
                </div>
              </div>
              <TransparentArea data={fin.sparkline} height={150} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 8px' }}>
                {fin.sparkline.map(function (m, i) {
                  return <span key={i} style={{ fontSize: '10px', color: 'var(--text-5)', textTransform: 'capitalize' }}>{m.name}</span>
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Accesos rápidos –” rejilla (sin scroll horizontal: el escalado ya no recorta) */}
        <p style={sectionLabel}>Accesos rápidos</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK.map(function(q) {
            var Icon = q.icon
            return (
              <motion.button key={q.label} type="button" onClick={function() { navigate(q.to) }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING.snappy}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.background = 'var(--brand-dim)' }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-2)' }}
                style={{ textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon style={{ width: '18px', height: '18px', color: 'var(--brand)' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{q.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{q.sub}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Secciones –” 2 columnas en escritorio */}
        <p style={sectionLabel}>Secciones</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {SECTIONS.map(function(s) {
            var Icon = s.icon
            return (
              <button key={s.label} type="button" onClick={function() { navigate(s.to) }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-md)', padding: '11px 12px', cursor: 'pointer', color: 'var(--text-2)', transition: 'background 0.12s, border-color 0.12s' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-md)', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '15px', height: '15px', color: 'var(--text-3)' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>{s.label}</span>
                <ChevronRight style={{ width: '15px', height: '15px', color: 'var(--text-5)' }} />
              </button>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-5)', marginTop: '28px' }}>
          AKIRA · inicio · build {typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev'}
        </p>
      </div>
      </div>

      {menuOpen && (
        <AccountMenu
          anchor={menuAnchor || { top: 60, left: window.innerWidth - 300 }}
          orgName={org?.name || 'Mi espacio'}
          plan="Pro"
          memberCount={members?.length || 1}
          initial={initial}
          email={user?.email}
          workspaces={workspaces || []}
          activeOrgId={org?.id}
          onSwitch={switchWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onSettings={() => openSettings('profile')}
          onInvite={() => openSettings('team')}
          onAddAccount={handleAddAccount}
          onSignOut={signOut}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {settingsOpen && <SettingsPanel onClose={function() { setSettingsOpen(false) }} initialTab={settingsTab} />}
    </div>
  )
}



