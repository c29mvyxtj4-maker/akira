import { useState, useEffect } from 'react'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import { motion } from 'framer-motion'
import {
  Users, FolderKanban, TrendingUp, AlertTriangle,
  CheckCircle, Clock, ArrowRight, Zap, Mail, UserX, Sparkles,
} from 'lucide-react'
import KpiCard       from '@/components/dashboard/KpiCard'
import RevenueChart  from '@/components/dashboard/RevenueChart'
import ActivityFeed  from '@/components/dashboard/ActivityFeed'
import QuickActions  from '@/components/dashboard/QuickActions'
import ForecastCard  from '@/components/dashboard/ForecastCard'
import { SkeletonText, SkeletonCard, SkeletonPageHeader } from '@/shared/components/ui/Skeleton'
import { useNotifications, buildInvoiceReminderMailto } from '@/shared/hooks/useNotifications'
import { getCompanySettings } from '@/services/company.service'
import { useNavigate } from 'react-router-dom'
import { WidgetGrid, useWidgets } from '@/modules/widgets'
import { useGlobalSync } from '@/modules/sync'
import { KpiCardGrid, DashboardGrid, DashboardPanel } from '@/components/dashboard'
import { useResponsive } from '@/shared/hooks/useResponsive'

function fmtCur(n) {
  if (!n && n !== 0) return '--'
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '–‚¬'
}
function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
function daysAgo(d) {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

var GREETING = (function() {
  var h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
})()

/* –”€–”€ Capa 1: tarjetas de "esto necesita tu atencion hoy" –”€–”€–”€–”€ */
function AttentionCard({ color, icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
        borderRadius: '12px', background: color + '0d', border: '1px solid ' + color + '30',
      }}
    >
      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '16px', height: '16px', color: color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>{subtitle}</p>
      </div>
      {actionLabel && (
        <button type="button" onClick={onAction}
          style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '7px', background: color + '20', border: '1px solid ' + color + '40', color: color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >{actionLabel}</button>
      )}
    </motion.div>
  )
}

function AttentionSection({ notifs, urgentTasks, company, navigate }) {
  var items = []

  notifs.overdueInvoices.forEach(function(inv) {
    var client = inv.clients
    items.push({
      key: 'inv-' + inv.id, color: '#f59e0b', icon: AlertTriangle,
      title: 'Factura vencida: ' + inv.invoice_number,
      subtitle: (client ? (client.company || client.name) : 'Sin cliente') + ' · ' + fmtCur(inv.total),
      actionLabel: client && client.email ? 'Enviar recordatorio' : null,
      onAction: function() {
        var url = buildInvoiceReminderMailto(inv, company || {})
        if (url) window.location.href = url
      },
    })
  })

  notifs.staleClients.slice(0, 3).forEach(function(c) {
    var d = daysAgo(c.last_contact_at)
    items.push({
      key: 'cli-' + c.id, color: '#3b82f6', icon: UserX,
      title: c.company || c.name,
      subtitle: d === null ? 'Nunca contactado' : 'Sin contacto desde hace ' + d + ' días',
      actionLabel: 'Ver cliente',
      onAction: function() { navigate('/clients') },
    })
  })

  ;(urgentTasks || []).slice(0, 3).forEach(function(t, i) {
    items.push({
      key: 'task-' + i, color: '#e63946', icon: Clock,
      title: t.text,
      subtitle: t.projectName || 'Tarea urgente',
      actionLabel: 'Ver proyecto',
      onAction: function() { navigate('/projects') },
    })
  })

  if (notifs.loading) return null

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderRadius: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', marginBottom: '24px' }}>
        <CheckCircle style={{ width: '18px', height: '18px', color: '#22c55e', flexShrink: 0 }} />
        <p style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>Todo al día –” sin nada urgente que atender ahora mismo</p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Esto necesita tu atención hoy
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.slice(0, 6).map(function(item) {
          return (
            <AttentionCard key={item.key} color={item.color} icon={item.icon} title={item.title} subtitle={item.subtitle}
              actionLabel={item.actionLabel} onAction={item.onAction}
            />
          )
        })}
      </div>
    </div>
  )
}

/* –”€–”€ Capa 3: oportunidades simples, sin inventar nada –”€–”€–”€–”€–”€–”€–”€ */
function OpportunitiesSection({ clients, projects, navigate }) {
  var ACTIVE_ST = ['pending', 'active', 'review']
  var clientsWithActiveProject = new Set(
    projects.filter(function(p) { return ACTIVE_ST.includes(p.status) && p.client_id }).map(function(p) { return p.client_id })
  )

  var opportunities = clients
    .filter(function(c) { return c.status === 'active' && !clientsWithActiveProject.has(c.id) })
    .slice(0, 3)

  if (opportunities.length === 0) return null

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Oportunidades
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {opportunities.map(function(c) {
          return (
            <AttentionCard key={c.id} color="#a855f7" icon={Sparkles}
              title={c.company || c.name}
              subtitle="Cliente activo sin ningÀºn proyecto en curso –” podría ser buen momento para proponerle algo nuevo"
              actionLabel="Ver cliente"
              onAction={function() { navigate('/clients') }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  var { kpis, loading, data } = useApp()
  var { profile }       = useAuth()
  var navigate           = useNavigate()
  var notifs = useNotifications()
  var [company, setCompany] = useState(null)
  var sync = useGlobalSync()
  var { dashboard, addWidget, removeWidget, updateWidget, reorderWidgets, saveDashboard } = useWidgets()
  var [showWidgets, setShowWidgets] = useState(false)

  useEffect(function() { getCompanySettings().then(setCompany).catch(function() {}) }, [])

  var name = profile && profile.full_name ? profile.full_name.split(' ')[0] : 'usuario'

  var revenueTrend = null
  if (kpis && kpis.revenueSparkline && kpis.revenueSparkline.length >= 2) {
    var sp = kpis.revenueSparkline
    var prevMonth = sp[sp.length - 2].value
    var lastMonth = sp[sp.length - 1].value
    if (prevMonth > 0) revenueTrend = Math.round(((lastMonth - prevMonth) / prevMonth) * 100)
  }

  // Iconos KPI: un Àºnico rojo de marca (coherente con la línea de acento
  // "siempre roja" de KpiCard). El sparkline recibe hex porque va a un
  // atributo SVG (stroke), donde var() no resuelve.
  var KPI_CARDS = [
    {
      title:     'MRR',
      value:     loading ? '...' : fmtCur(kpis && kpis.mrr),
      subtitle:  revenueTrend !== null
        ? (revenueTrend >= 0 ? '+' : '') + revenueTrend + '% este mes vs el anterior'
        : 'Ingresos recurrentes mensuales',
      icon:      TrendingUp,
      sparklineData: kpis && kpis.revenueSparkline,
      sparklineColor: '#e63946',
      delay: 0,
    },
    {
      title:     'Clientes activos',
      value:     loading ? '...' : (kpis ? kpis.activeClients : 0),
      subtitle:  (kpis ? kpis.leads : 0) + ' leads · ' + (kpis ? kpis.atRisk : 0) + ' en riesgo',
      icon:      Users,
      delay: 0.05,
    },
    {
      title:     'Proyectos activos',
      value:     loading ? '...' : (kpis ? kpis.activeProjects : 0),
      subtitle:  'Proyectos en curso o pendientes',
      icon:      FolderKanban,
      delay: 0.1,
    },
    {
      title:     'Ingresos este mes',
      value:     loading ? '...' : fmtCur(kpis && kpis.monthIncome),
      subtitle:  'Gastos: ' + fmtCur(kpis && kpis.monthExpense),
      icon:      TrendingUp,
      delay: 0.15,
    },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Saludo + Sync Status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            {GREETING}, {name} ðŸ‘‹
          </h1>
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--brand-500)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
          >
            {showWidgets ? 'Ocultar widgets' : 'Mostrar widgets'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {!sync.isOnline && (
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--warning)/10', color: 'var(--warning)' }}>
              Modo offline
            </span>
          )}
          {sync.queueLength > 0 && (
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--info)/10', color: 'var(--info)' }}>
              {sync.queueLength} cambios pendientes
            </span>
          )}
        </div>
      </motion.div>

      {/* Widget Grid - NEW v2.0 Feature */}
      {showWidgets && dashboard && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ marginBottom: '24px' }}
        >
          <WidgetGrid
            dashboard={dashboard}
            onUpdateDashboard={saveDashboard}
            onAddWidget={addWidget}
            onRemoveWidget={removeWidget}
            onReorderWidgets={reorderWidgets}
          />
        </motion.div>
      )}

      {/* CAPA 1 –” atencion hoy */}
      <AttentionSection notifs={notifs} urgentTasks={kpis && kpis.urgentTasksList} company={company} navigate={navigate} />

      {/* CAPA 3 –” oportunidades */}
      {data && <OpportunitiesSection clients={data.clients} projects={data.projects} navigate={navigate} />}

      {/* CAPA 2 –” como va tu negocio (Responsive: xs:1 md:2 lg:3 xl:4) */}
      <KpiCardGrid gap="md">
        {loading ? (
          // Show skeleton loading state for KPI cards
          [1, 2, 3, 4].map(function(i) {
            return (
              <SkeletonCard key={i} className="min-h-[140px]" />
            )
          })
        ) : (
          KPI_CARDS.map(function(card) {
            return (
              <KpiCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                sparklineData={card.sparklineData}
                sparklineColor={card.sparklineColor}
                delay={card.delay}
              />
            )
          })
        )}
      </KpiCardGrid>

      {/* Charts, previsión y acciones rapidas (Responsive: xs:1 md:1 lg:2) */}
      <DashboardGrid variant="charts" gap="md" style={{ marginBottom: '24px' }}>
        <DashboardPanel title="Revenue" className="dashboard-chart-panel">
          <RevenueChart
            revenueSparkline={kpis && kpis.revenueSparkline}
            clientsByStatus={kpis && kpis.clientsByStatus}
            projectsByStatus={kpis && kpis.projectsByStatus}
          />
        </DashboardPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ForecastCard />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="dash-panel"
          >
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>Acciones rápidas</h3>
            <QuickActions />
          </motion.div>
        </div>
      </DashboardGrid>

      {/* Proximas entregas */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dash-panel"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>Próximas entregas</h3>
          <button type="button" onClick={function() { navigate('/projects') }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '11px', fontWeight: 600 }}
          >Ver todos <ArrowRight style={{ width: '12px', height: '12px' }} /></button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3].map(function(i) {
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <SkeletonText width="60%" height="14px" />
                  <SkeletonText width="40%" height="12px" />
                </div>
              )
            })}
          </div>
        ) : !kpis || !kpis.upcomingProjects || kpis.upcomingProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-5)', fontSize: '13px' }}>
            Sin entregas próximas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {kpis.upcomingProjects.slice(0, 5).map(function(p) {
              var daysLeft = Math.ceil((new Date(p.due_date) - new Date()) / (1000 * 60 * 60 * 24))
              var isUrgent = daysLeft <= 3
              var openProject = function() { navigate('/projects') }
              return (
                <div key={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={'Ver proyecto ' + p.name}
                  onClick={openProject}
                  onKeyDown={function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject() } }}
                  className="dash-row"
                  style={isUrgent ? { background: 'var(--brand-dim)', borderColor: 'var(--brand-border)' } : undefined}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isUrgent ? 'var(--brand)' : 'var(--text-4)', boxShadow: isUrgent ? '0 0 6px rgba(230,57,70,0.6)' : 'none', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>{p.client_name || ''}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: isUrgent ? 'var(--brand)' : 'var(--text-3)' }}>
                      {daysLeft <= 0 ? 'Vencido' : daysLeft === 1 ? 'Mañana' : daysLeft + 'd'}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-5)', marginTop: '1px' }}>{fmtDate(p.due_date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Actividad reciente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="dash-panel"
      >
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>Actividad reciente</h3>
        <ActivityFeed />
      </motion.div>
    </div>
  )
}



