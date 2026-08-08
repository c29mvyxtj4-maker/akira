import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { scopeToOrg } from '@/lib/activeOrg'

const AppContext = createContext(null)

function useToasts() {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback(function(t) {
    var id = Math.random().toString(36).slice(2)
    setToasts(function(prev) { return prev.concat([Object.assign({ id: id }, t)]) })
    setTimeout(function() { setToasts(function(prev) { return prev.filter(function(x) { return x.id !== id }) }) }, t.duration || 4000)
  }, [])
  const removeToast = useCallback(function(id) { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id }) }) }, [])
  const toast = useMemo(function() {
    return {
      success: function(msg, opts) { addToast(Object.assign({ type: 'success', message: msg }, opts)) },
      error:   function(msg, opts) { addToast(Object.assign({ type: 'error',   message: msg }, opts)) },
      warning: function(msg, opts) { addToast(Object.assign({ type: 'warning', message: msg }, opts)) },
      info:    function(msg, opts) { addToast(Object.assign({ type: 'info',    message: msg }, opts)) },
    }
  }, [addToast])
  return { toasts: toasts, toast: toast, removeToast: removeToast }
}

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toggleSidebar = useCallback(function() { setSidebarCollapsed(function(v) { return !v }) }, [])
  const { toasts, toast, removeToast } = useToasts()

  // Tab management (like Notion)
  const [openTabs, setOpenTabs] = useState([
    { id: 'inicio', label: 'Inicio', icon: 'home', route: '/inicio' }
  ])
  const [activeTabId, setActiveTabId] = useState('inicio')

  const addTab = useCallback(function(tab) {
    setOpenTabs(function(prev) {
      var exists = prev.find(function(t) { return t.route === tab.route })
      if (exists) { setActiveTabId(exists.id); return prev }
      return prev.concat([tab])
    })
    setActiveTabId(tab.id)
  }, [])

  const closeTab = useCallback(function(tabId) {
    setOpenTabs(function(prev) {
      var filtered = prev.filter(function(t) { return t.id !== tabId })
      if (filtered.length === 0) filtered = [{ id: 'inicio', label: 'Inicio', icon: 'home', route: '/inicio' }]
      return filtered
    })
    if (activeTabId === tabId) {
      setActiveTabId(openTabs[openTabs.length - 1]?.id || 'inicio')
    }
  }, [activeTabId, openTabs])

  const closeAllTabs = useCallback(function() {
    setOpenTabs([{ id: 'inicio', label: 'Inicio', icon: 'home', route: '/inicio' }])
    setActiveTabId('inicio')
  }, [])

  const [data, setData] = useState({
    clients: [], projects: [], services: [], subscriptions: [], financeEntries: [],
  })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const fetchAll = useCallback(function() {
    if (!isAuthenticated) { setLoading(false); return }
    setLoading(true)
    setError(null)

    Promise.allSettled([
      scopeToOrg(supabase.from('clients').select('*').eq('archived', false)).order('created_at', { ascending: false }),
      scopeToOrg(supabase.from('projects').select('*, clients(id,name)').eq('archived', false)).order('due_date', { ascending: true, nullsFirst: false }),
      scopeToOrg(supabase.from('services').select('*').eq('archived', false)),
      scopeToOrg(supabase.from('subscriptions').select('*').eq('archived', false)),
      scopeToOrg(supabase.from('finance_entries').select('*').eq('archived', false)).order('entry_date', { ascending: false }).limit(200),
    ]).then(function(results) {
      function safe(r) {
        if (r.status === 'rejected') return []
        if (r.value && r.value.error) { console.warn('[AppStore]', r.value.error.message); return [] }
        return Array.isArray(r.value && r.value.data) ? r.value.data : []
      }

      var clients       = safe(results[0])
      var projects      = safe(results[1]).map(function(p) { return Object.assign({}, p, { tasks: Array.isArray(p.tasks) ? p.tasks : [] }) })
      var services      = safe(results[2])
      var subscriptions = safe(results[3])
      var finance       = safe(results[4])

      setData({ clients: clients, projects: projects, services: services, subscriptions: subscriptions, financeEntries: finance })
      setLastSync(new Date())
      setLoading(false)
    })
  }, [isAuthenticated])

  useEffect(function() { fetchAll() }, [fetchAll])

  // Realtime — escucha cambios en todas las tablas principales
  useEffect(function() {
    if (!isAuthenticated) return
    var channel = supabase.channel('akira-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' },       function() { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },      function() { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' },      function() { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, function() { fetchAll() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_entries' }, function() { fetchAll() })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [isAuthenticated, fetchAll])

  const kpis = useMemo(function() {
    var clients       = data.clients
    var projects      = data.projects
    var subscriptions = data.subscriptions
    var finance       = data.financeEntries

    var activeClients  = clients.filter(function(c) { return c.status === 'active' }).length
    var leads          = clients.filter(function(c) { return c.status === 'lead' }).length
    var atRisk         = clients.filter(function(c) { return c.status === 'at_risk' }).length

    var clientsByStatus = [
      { name: 'Activo',    value: clients.filter(function(c) { return c.status === 'active' }).length,  color: '#22c55e' },
      { name: 'Lead',      value: clients.filter(function(c) { return c.status === 'lead' }).length,    color: '#6366f1' },
      { name: 'En riesgo', value: clients.filter(function(c) { return c.status === 'at_risk' }).length, color: '#ef4444' },
      { name: 'Pausado',   value: clients.filter(function(c) { return c.status === 'paused' }).length,  color: '#f59e0b' },
      { name: 'Perdido',   value: clients.filter(function(c) { return c.status === 'lost' }).length,    color: '#374151' },
    ].filter(function(d) { return d.value > 0 })

    var ACTIVE_ST = ['pending', 'active', 'review']
    var activeProjects = projects.filter(function(p) { return ACTIVE_ST.includes(p.status) }).length

    var projectsByStatus = {}
    projects.forEach(function(p) {
      var st = p.status || 'unknown'
      projectsByStatus[st] = (projectsByStatus[st] || 0) + 1
    })
    var projectsByStatusArr = Object.entries(projectsByStatus).map(function(e) {
      var COLORS = { pending: '#6366f1', active: '#22c55e', review: '#f59e0b', completed: '#3b82f6', cancelled: '#374151' }
      return { name: e[0], value: e[1], color: COLORS[e[0]] || '#6366f1' }
    }).filter(function(d) { return d.value > 0 })

    var pendingTasks = 0
    var urgentTasks  = 0
    var urgentTasksList = []
    var upcomingProjects = []

    var now   = new Date()
    var in30d = new Date(now.getTime() + 30 * 86400000)

    projects.forEach(function(p) {
      var tasks = Array.isArray(p.tasks) ? p.tasks : []
      tasks.forEach(function(t) {
        if (!t.done) {
          pendingTasks++
          if (t.priority === 'high' || t.priority === 'urgent') {
            urgentTasks++
            urgentTasksList.push(Object.assign({}, t, { projectName: p.name, projectId: p.id }))
          }
        }
      })
      if (p.due_date && !['completed','cancelled'].includes(p.status)) {
        var d = new Date(p.due_date)
        if (d >= now && d <= in30d) upcomingProjects.push(p)
      }
    })

    upcomingProjects = upcomingProjects.slice(0, 5)

    var now2       = new Date()
    var monthStart = new Date(now2.getFullYear(), now2.getMonth(), 1)

    // ← CAMBIO AQUÍ: una factura "confirmed" también cuenta como ingreso real
    var monthIncome = finance
      .filter(function(e) {
        var esIngresoReal = ['income','payment'].includes(e.type) || (e.type === 'invoice' && e.status === 'confirmed')
        return esIngresoReal && new Date(e.entry_date) >= monthStart
      })
      .reduce(function(s, e) { return s + Number(e.amount) }, 0)

    var monthExpense = finance
      .filter(function(e) { return e.type === 'expense' && new Date(e.entry_date) >= monthStart })
      .reduce(function(s, e) { return s + Number(e.amount) }, 0)

    var pendingInvoices = finance
      .filter(function(e) { return e.type === 'invoice' && e.status === 'pending' })
      .reduce(function(s, e) { return s + Number(e.amount) }, 0)

    var mrr = subscriptions
      .filter(function(s) { return s.status === 'active' })
      .reduce(function(sum, s) {
        var p = Number(s.price) || 0
        return sum + (s.period === 'yearly' ? p / 12 : s.period === 'quarterly' ? p / 3 : s.period === 'weekly' ? p * 4.33 : p)
      }, 0)

    var months = Array.from({ length: 6 }, function(_, i) {
      var d = new Date(now2.getFullYear(), now2.getMonth() - (5 - i), 1)
      return { name: d.toLocaleDateString('es-ES', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() }
    })

    // ← CAMBIO AQUÍ también: el gráfico de ingresos usa la misma regla nueva
    var revenueSparkline = months.map(function(m) {
      return {
        name: m.name,
        value: finance
          .filter(function(e) {
            var d = new Date(e.entry_date)
            var esIngresoReal = ['income','payment'].includes(e.type) || (e.type === 'invoice' && e.status === 'confirmed')
            return esIngresoReal && d.getFullYear() === m.year && d.getMonth() === m.month
          })
          .reduce(function(s, e) { return s + Number(e.amount) }, 0),
      }
    })

    return {
      activeClients: activeClients, leads: leads, atRisk: atRisk,
      activeProjects: activeProjects, pendingTasks: pendingTasks,
      urgentTasks: urgentTasks, urgentTasksList: urgentTasksList,
      upcomingProjects: upcomingProjects,
      mrr: mrr, monthIncome: monthIncome, monthExpense: monthExpense,
      pendingInvoices: pendingInvoices,
      clientsByStatus: clientsByStatus,
      projectsByStatus: projectsByStatusArr,
      revenueSparkline: revenueSparkline,
    }
  }, [data])

  return (
    <AppContext.Provider value={{
      sidebarCollapsed: sidebarCollapsed,
      toggleSidebar: toggleSidebar,
      setSidebarCollapsed: setSidebarCollapsed,
      toasts: toasts,
      toast: toast,
      removeToast: removeToast,
      data: data,
      loading: loading,
      error: error,
      lastSync: lastSync,
      refresh: fetchAll,
      kpis: kpis,
      openTabs: openTabs,
      activeTabId: activeTabId,
      setActiveTabId: setActiveTabId,
      addTab: addTab,
      closeTab: closeTab,
      closeAllTabs: closeAllTabs,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = function() {
  var ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}