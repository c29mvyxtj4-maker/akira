import { useState } from 'react'
import { useApp }  from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { Bell, RefreshCw, Menu, X, Search } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationsPanel from './NotificationsPanel'

export default function Topbar({ collapsed, mobileOpen, onMobileToggle, onSearchClick, autoHide, hidden, onMouseLeave }) {
  var { lastSync, refresh, loading, kpis } = useApp()
  var { profile } = useAuth()
  var [refreshing, setRefreshing] = useState(false)
  var [showNotifs, setShowNotifs] = useState(false)

  var notifs = useNotifications()
  var urgentCount = (kpis && kpis.urgentTasksList) ? kpis.urgentTasksList.length : 0
  var badgeCount = notifs.total + urgentCount

  function handleRefresh() {
    setRefreshing(true)
    refresh()
    setTimeout(function() { setRefreshing(false) }, 1000)
  }

  return (
    <div
      className={'topbar' + (autoHide ? ' topbar--auto' : '') + (autoHide && hidden ? ' topbar--hidden' : '')}
      onMouseLeave={autoHide ? onMouseLeave : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, overflow: 'hidden' }}>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMobileToggle}
          title="Abrir menú"
          style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-2)', flexShrink: 0,
          }}
        >
          {mobileOpen
            ? <X style={{ width: '18px', height: '18px' }} />
            : <Menu style={{ width: '18px', height: '18px' }} />
          }
        </button>

        <button
          type="button"
          onClick={onSearchClick}
          title="Buscar (Ctrl+K)"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: '5px var(--space-2)', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            color: 'var(--text-4)', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Search style={{ width: '13px', height: '13px' }} />
          <span className="hidden md:inline" style={{ fontSize: 'var(--text-xs)' }}>Buscar</span>
          <span className="hidden md:inline" style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'var(--bg-4)', color: 'var(--text-5)' }}>Ctrl K</span>
        </button>

        <div className="topbar-info" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: loading ? 'var(--status-warning, #f59e0b)' : '#22c55e',
            boxShadow: loading ? 'none' : '0 0 6px rgba(34,197,94,0.6)',
            animation: loading ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-5)', whiteSpace: 'nowrap' }}>
            {loading ? 'Sincronizando...' : lastSync ? 'Sync ' + lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Conectado'}
          </span>
        </div>

        {kpis && (
          <div className="topbar-kpis" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {[
              { label: 'MRR', value: Math.round(kpis.mrr) + '€', color: '#22c55e' },
              { label: 'Clientes', value: kpis.activeClients, color: 'var(--brand)' },
              { label: 'Proyectos', value: kpis.activeProjects, color: '#3b82f6' },
            ].map(function(k) {
              return (
                <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: k.color }}>{k.value}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0, position: 'relative' }}>
        <button
          type="button"
          onClick={handleRefresh}
          title="Actualizar datos"
          style={{
            width: '30px', height: '30px', borderRadius: 'var(--radius-md)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.1s',
          }}
          onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-1)' }}
          onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-4)' }}
        >
          <RefreshCw style={{ width: '14px', height: '14px', animation: refreshing ? 'spin 0.8s linear' : 'none' }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={function() { setShowNotifs(function(v) { return !v }) }}
            style={{
              width: '30px', height: '30px', borderRadius: 'var(--radius-md)',
              background: showNotifs ? 'var(--bg-3)' : 'none', border: 'none', cursor: 'pointer',
              color: showNotifs ? 'var(--text-1)' : 'var(--text-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.1s',
            }}
          >
            <Bell style={{ width: '14px', height: '14px' }} />
            {badgeCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                minWidth: '14px', height: '14px', padding: '0 3px', borderRadius: '10px',
                background: 'var(--brand)',
                boxShadow: '0 0 6px rgba(230,57,70,0.7)',
                fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>{badgeCount > 9 ? '9+' : badgeCount}</span>
            )}
          </button>

          {showNotifs && (
            <NotificationsPanel
              urgentTasks={kpis && kpis.urgentTasksList}
              onClose={function() { setShowNotifs(false) }}
            />
          )}
        </div>

        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--text-sm)', fontWeight: 700, color: '#fff', cursor: 'pointer',
          boxShadow: '0 0 8px rgba(230,57,70,0.3)', flexShrink: 0,
        }}>
          {profile && profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
        </div>
      </div>
    </div>
  )
}