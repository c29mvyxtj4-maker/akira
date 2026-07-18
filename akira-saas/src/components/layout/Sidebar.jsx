import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, FolderKanban, Wrench,
  CreditCard, TrendingUp, Receipt, FileSignature, Calendar, BookOpen,
  Brain, Settings, ChevronLeft, ChevronRight, ChevronDown,
  LogOut, Clock, Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useApp }  from '@/context/AppContext'

var GROUPS = [
  { id: 'home',     label: 'Centro de mando', icon: LayoutDashboard, to: '/' },
  { id: 'accounts', label: 'Cuentas',         icon: Users,           to: '/clients' },
  {
    id: 'work', label: 'Trabajo', icon: FolderKanban,
    children: [
      { to: '/projects', icon: FolderKanban, label: 'Proyectos' },
      { to: '/calendar', icon: Calendar,     label: 'Calendario' },
      { to: '/time',     icon: Clock,        label: 'Tiempo' },
    ],
  },
  {
    id: 'money', label: 'Dinero', icon: TrendingUp,
    children: [
      { to: '/finance',   icon: TrendingUp,   label: 'Finanzas' },
      { to: '/offers',    icon: Wrench,       label: 'Ofertas' },
      { to: '/documents', icon: FileSignature, label: 'Documentos' },
    ],
  },
  {
    id: 'akira', label: 'Akira', icon: Brain,
    children: [
      { to: '/brain',       icon: Brain,    label: 'Akira Brain' },
      { to: '/knowledge',   icon: BookOpen, label: 'Conocimiento' },
      { to: '/operatives',  icon: Zap,      label: 'AI Operatives' },
    ],
  },
]

function Logo({ collapsed }) {
  return (
    <div className="sidebar-logo">
      <div className="sidebar-logo-mark" role="img" aria-label="AKIRA" />
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <div className="sidebar-logo-text">AKIRA</div>
            <div className="sidebar-logo-version">Business OS</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function isGroupActive(group, pathname) {
  if (group.to) return group.to === '/' ? pathname === '/' : pathname.startsWith(group.to)
  return (group.children || []).some(function(c) { return pathname.startsWith(c.to) })
}

export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
  var { signOut, profile } = useAuth()
  var location = useLocation()

  var [expanded, setExpanded] = useState(function() {
    var active = GROUPS.find(function(g) { return g.children && isGroupActive(g, location.pathname) })
    return active ? active.id : null
  })

  useEffect(function() {
    var active = GROUPS.find(function(g) { return g.children && isGroupActive(g, location.pathname) })
    if (active) setExpanded(active.id)
  }, [location.pathname])

  var W = collapsed ? 52 : 220

  function toggleGroup(id) {
    setExpanded(function(prev) { return prev === id ? null : id })
  }

  return (
    <motion.div
      className={'sidebar' + (mobileOpen ? ' mobile-open' : '')}
      animate={{ width: W }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ width: W }}
    >
      {/* Logo */}
      <Logo collapsed={collapsed} />

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}>
        {GROUPS.map(function(group) {
          var Icon = group.icon
          var active = isGroupActive(group, location.pathname)
          var isExpanded = expanded === group.id
          var hasChildren = !!group.children

          if (!hasChildren) {
            return (
              <NavLink
                key={group.id}
                to={group.to}
                className={'nav-item' + (active ? ' active' : '')}
                title={collapsed ? group.label : ''}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <Icon className="nav-item-icon" style={{ width: '16px', height: '16px' }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 'var(--text-base)', fontWeight: 600 }}
                    >
                      {group.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          }

          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={function() { if (collapsed) return; toggleGroup(group.id) }}
                className={'nav-item' + (active && !isExpanded ? ' active' : '')}
                title={collapsed ? group.label : ''}
                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <Icon className="nav-item-icon" style={{ width: '16px', height: '16px' }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', flex: 1 }}
                    >
                      {group.label}
                      <ChevronDown style={{ width: '13px', height: '13px', marginLeft: 'auto', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {!collapsed && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {group.children.map(function(child) {
                      var ChildIcon = child.icon
                      var childActive = location.pathname.startsWith(child.to)
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={'nav-item' + (childActive ? ' active' : '')}
                          style={{ paddingLeft: '30px', fontSize: 'var(--text-sm)' }}
                        >
                          <ChildIcon className="nav-item-icon" style={{ width: '14px', height: '14px' }} />
                          <span style={{ fontSize: 'var(--text-sm)' }}>{child.label}</span>
                        </NavLink>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-2)' }}>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={'nav-item' + (location.pathname === '/settings' ? ' active' : '')}
          title={collapsed ? 'Configuración' : ''}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: '2px' }}
        >
          <Settings style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)' }}>
                Configuración
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* User */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-1)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {profile && profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile && profile.full_name ? profile.full_name : 'Usuario'}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {profile && profile.role ? profile.role : 'Owner'}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Cerrar sesión"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-5)', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px', flexShrink: 0 }}
              onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--brand)' }}
              onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--text-5)' }}
            >
              <LogOut style={{ width: '13px', height: '13px' }} />
            </button>
          </motion.div>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '28px', marginTop: 'var(--space-1)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-5)', borderRadius: 'var(--radius-md)',
            transition: 'all 0.1s',
          }}
          onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-2)' }}
          onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-5)' }}
        >
          {collapsed
            ? <ChevronRight style={{ width: '14px', height: '14px' }} />
            : <ChevronLeft  style={{ width: '14px', height: '14px' }} />
          }
        </button>
      </div>
    </motion.div>
  )
}