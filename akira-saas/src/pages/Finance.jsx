import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Archive, Edit3, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Clock,
  Filter, ChevronDown, ChevronUp, Download,
} from 'lucide-react'
import Toast, { useToast } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { ResponsiveGrid } from '@/components/responsive'
import { exportToCsv } from '@/shared/utils/exportCsv'
import {
  getFinanceEntries, createFinanceEntry, updateFinanceEntry,
  archiveFinanceEntry, getFinanceKpis, getClientRanking,
  getSelectorsForFinance, FINANCE_TYPES, FINANCE_STATUS,
} from '@/services/finance.service'
import { getFinanceCategories } from '@/services/categories.service'
import PageHeader      from '@/shared/components/layout/PageHeader'
import Modal           from '@/shared/components/ui/Modal'
import Badge           from '@/shared/components/ui/Badge'
import Button          from '@/shared/components/ui/Button'
import EmptyState      from '@/shared/components/ui/EmptyState'
import { PageSpinner } from '@/shared/components/ui/Spinner'
import AreaChart       from '@/shared/components/charts/AreaChart'
import clsx            from 'clsx'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

/* –”€–”€ KPI Card –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function KpiCard({ label, value, sub, color, trend, icon: Icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      className="surface-card p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-text-4 uppercase tracking-wider">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-text-4" />}
      </div>
      <p className="text-2xl font-black" style={{ color: color }}>{value}</p>
      {sub && <p className="text-xs text-text-4 mt-1">{sub}</p>}
      {trend !== null && trend !== undefined && (
        <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-medium', trend >= 0 ? 'text-status-success' : 'text-status-danger')}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs mes anterior
        </div>
      )}
    </motion.div>
  )
}

/* –”€–”€ Formulario –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function FinanceForm({ initial, selectors, categories, onSave, onCancel, loading }) {
  var today = new Date().toISOString().split('T')[0]
  var EMPTY = {
    type: 'income', category: categories[0] || 'General', description: '',
    amount: '', entry_date: today, status: 'confirmed',
    client_id: '', project_id: '', notes: '',
  }
  var [form, setForm] = useState(function() {
    if (!initial) return EMPTY
    return {
      type:        initial.type        || 'income',
      category:    initial.category    || (categories[0] || 'General'),
      description: initial.description || '',
      amount:      initial.amount      != null ? String(initial.amount) : '',
      entry_date:  initial.entry_date  || today,
      status:      initial.status      || 'confirmed',
      client_id:   initial.client_id   || '',
      project_id:  initial.project_id  || '',
      notes:       initial.notes       || '',
    }
  })

  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  var typeCfg = FINANCE_TYPES[form.type]
  var amount  = Number(form.amount) || 0

  return (
    <form onSubmit={function(e) { e.preventDefault(); if (!form.description.trim() || !amount) return; onSave(form) }} className="space-y-4">

      {/* Tipo –” pills */}
      <div>
        <label className="label-base">Tipo de movimiento</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {Object.entries(FINANCE_TYPES).map(function(entry) {
            var k = entry[0]; var cfg = entry[1]
            var isActive = form.type === k
            return (
              <button key={k} type="button"
                onClick={function() { setForm(function(f) { return Object.assign({}, f, { type: k }) }) }}
                style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  background: isActive ? cfg.color + '22' : 'rgba(255,255,255,0.04)',
                  border: '1px solid ' + (isActive ? cfg.color : 'rgba(255,255,255,0.08)'),
                  color: isActive ? cfg.color : '#94a3b8',
                  transition: 'all 0.15s',
                }}
              >{cfg.label}</button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label-base">Descripción *</label>
          <input value={form.description} onChange={set('description')} placeholder="Factura cliente / Gasto equipo..." style={INP} />
        </div>
        <div>
          <label className="label-base">Importe (–‚¬) *</label>
          <input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" style={INP} />
        </div>
        <div>
          <label className="label-base">Fecha</label>
          <input type="date" value={form.entry_date} onChange={set('entry_date')} style={INP} />
        </div>
        <div>
          <label className="label-base">Categoría</label>
          <select value={form.category} onChange={set('category')} style={INP}>
            {categories.map(function(c) { return <option key={c} value={c}>{c}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Estado</label>
          <select value={form.status} onChange={set('status')} style={INP}>
            {Object.entries(FINANCE_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Cliente</label>
          <select value={form.client_id} onChange={set('client_id')} style={INP}>
            <option value="">Sin cliente</option>
            {(selectors.clients || []).map(function(c) { return <option key={c.id} value={c.id}>{c.name}{c.company ? ' - ' + c.company : ''}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Proyecto</label>
          <select value={form.project_id} onChange={set('project_id')} style={INP}>
            <option value="">Sin proyecto</option>
            {(selectors.projects || []).map(function(p) { return <option key={p.id} value={p.id}>{p.name}</option> })}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label-base">Notas</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Informacion adicional..." style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
      </div>

      {/* Preview */}
      {amount > 0 && typeCfg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: typeCfg.color + '44', background: typeCfg.color + '0d' }}>
          <span style={{ fontSize: '24px', fontWeight: 900, color: typeCfg.color }}>
            {typeCfg.sign > 0 ? '+' : '-'}{fmtCur(amount)}
          </span>
          <div>
            <p className="text-xs font-semibold" style={{ color: typeCfg.color }}>{typeCfg.label}</p>
            <p className="text-2xs text-text-4">{form.entry_date || today}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear movimiento'}</Button>
      </div>
    </form>
  )
}

/* –”€–”€ Tabla de entradas –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function EntriesTable({ entries, onEdit, onArchive, loading }) {
  if (loading) return <PageSpinner label="Cargando movimientos..." />
  if (entries.length === 0) return (
    <EmptyState icon={DollarSign} title="Sin movimientos" description="No hay entradas que coincidan con los filtros." size="sm" />
  )

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Fecha', 'Tipo', 'Descripción', 'Cliente', 'Proyecto', 'Importe', 'Estado', ''].map(function(h) {
              return (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {entries.map(function(e) {
            var tc  = FINANCE_TYPES[e.type]  || FINANCE_TYPES.income
            var sc  = FINANCE_STATUS[e.status] || FINANCE_STATUS.confirmed
            return (
              <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                onMouseEnter={function(ev) { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={function(ev) { ev.currentTarget.style.background = 'transparent' }}
              >
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(e.entry_date)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: tc.color + '22', color: tc.color, border: '1px solid ' + tc.color + '44', whiteSpace: 'nowrap' }}>
                    {tc.label}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: '#f1f5f9', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.description}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94a3b8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.clients ? (e.clients.company || e.clients.name) : '--'}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94a3b8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.projects ? e.projects.name : '--'}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: tc.sign > 0 ? '#22c55e' : '#ef4444', whiteSpace: 'nowrap' }}>
                  {tc.sign > 0 ? '+' : '-'}{fmtCur(e.amount)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Badge color={sc.color} size="xs">{sc.label}</Badge>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={function() { onEdit(e) }}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
                    ><Edit3 style={{ width: '13px', height: '13px' }} /></button>
                    <button type="button" onClick={function() { onArchive(e.id) }}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                    ><Archive style={{ width: '13px', height: '13px' }} /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* –”€–”€ Ranking de clientes –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function ClientRanking({ ranking }) {
  if (ranking.length === 0) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '13px' }}>Sin datos de clientes todavia</div>
  )
  var max = ranking[0] ? ranking[0].income : 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {ranking.map(function(c, i) {
        var pct = max > 0 ? Math.round((c.income / max) * 100) : 0
        return (
          <div key={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, width: '16px' }}>#{i + 1}</span>
                <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 500 }}>{c.name}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{fmtCur(c.income)}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   PAGINA PRINCIPAL
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
export default function Finance() {
  var [entries,     setEntries]     = useState([])
  var [kpis,        setKpis]        = useState(null)
  var [ranking,     setRanking]     = useState([])
  var [selectors,   setSelectors]   = useState({ clients: [], projects: [] })
  var [categories,  setCategories]  = useState([]) // –† NUEVO
  var [loading,     setLoading]     = useState(true)
  var [kpisLoading, setKpisLoading] = useState(true)
  var [error,       setError]       = useState(null)

  var [search,      setSearch]      = useState('')
  var [type,        setType]        = useState('all')
  var [status,      setStatus]      = useState('all')
  var [clientId,    setClientId]    = useState('all')
  var [dateFrom,    setDateFrom]    = useState('')
  var [dateTo,      setDateTo]      = useState('')
  var [showFilters, setShowFilters] = useState(false)

  var [modalOpen,   setModalOpen]   = useState(false)
  var [editing,     setEditing]     = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [toastMsg,    setToastMsg]    = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  function loadCategories() { // –† NUEVO
    getFinanceCategories()
      .then(function(rows) { setCategories(rows.map(function(r) { return r.name })) })
      .catch(function() { setCategories(['General']) })
  }

  useEffect(function() {
    getSelectorsForFinance().then(function(d) { setSelectors(d) }).catch(function() {})
    loadCategories() // –† NUEVO

    setKpisLoading(true)
    Promise.all([getFinanceKpis(), getClientRanking()])
      .then(function(results) { setKpis(results[0]); setRanking(results[1]) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setKpisLoading(false) })
  }, [])

  var loadEntries = useCallback(function() {
    setLoading(true)
    setError(null)
    getFinanceEntries({ search: search, type: type, status: status, clientId: clientId, dateFrom: dateFrom, dateTo: dateTo })
      .then(function(data) { setEntries(data); setLoading(false) })
      .catch(function(e) { setError(e.message); setLoading(false) })
  }, [search, type, status, clientId, dateFrom, dateTo])

  useEffect(function() {
    var t = setTimeout(loadEntries, 300)
    return function() { clearTimeout(t) }
  }, [loadEntries])

  function refreshKpis() {
    Promise.all([getFinanceKpis(), getClientRanking()])
      .then(function(results) { setKpis(results[0]); setRanking(results[1]) })
      .catch(function() {})
  }

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(e)  { setEditing(e);   setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleExport() {
    if (!entries.length) return
    var columns = [
      { key: 'entry_date',  label: 'Fecha' },
      { key: 'type_label',  label: 'Tipo' },
      { key: 'description', label: 'Descripción' },
      { key: 'client',      label: 'Cliente' },
      { key: 'project',     label: 'Proyecto' },
      { key: 'amount',      label: 'Importe (–‚¬)' },
      { key: 'status_label',label: 'Estado' },
    ]
    var rows = entries.map(function(e) {
      var tc = FINANCE_TYPES[e.type] || FINANCE_TYPES.income
      var sc = FINANCE_STATUS[e.status] || FINANCE_STATUS.confirmed
      return {
        entry_date:   e.entry_date,
        type_label:   tc.label,
        description:  e.description || '',
        client:       e.clients ? (e.clients.company || e.clients.name) : '',
        project:      e.projects ? e.projects.name : '',
        amount:       (tc.sign > 0 ? '' : '-') + (Number(e.amount) || 0),
        status_label: sc.label,
      }
    })
    var today = new Date().toISOString().slice(0, 10)
    exportToCsv('finanzas_' + today, columns, rows)
  }

  function handleSave(form) {
    setFormLoading(true)
    var promise = editing ? updateFinanceEntry(editing.id, form) : createFinanceEntry(form)
    promise
      .then(function(saved) {
        if (editing) {
          setEntries(function(prev) { return prev.map(function(e) { return e.id === saved.id ? saved : e }) })
          showToast('Movimiento actualizado')
        } else {
          setEntries(function(prev) { return [saved].concat(prev) })
          showToast('Movimiento creado')
        }
        closeModal()
        refreshKpis()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  const { toasts, show, dismiss } = useToast()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null)

  function handleArchive(id) {
    setShowArchiveConfirm(id)
  }

  function confirmArchive() {
    if (!showArchiveConfirm) return
    archiveFinanceEntry(showArchiveConfirm)
      .then(function() {
        setEntries(function(prev) { return prev.filter(function(e) { return e.id !== showArchiveConfirm }) })
        show('Movimiento archivado', 'success', 3000)
        setShowArchiveConfirm(null)
        refreshKpis()
      })
      .catch(function(e) { show('Error: ' + (e.message || e), 'error', 3000); setShowArchiveConfirm(null) })
  }

  var SI = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', padding: '6px 10px',
    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Finanzas"
        description="Ingresos, gastos y rentabilidad del negocio"
        actions={<>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport} disabled={!entries.length}>Exportar CSV</Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nuevo movimiento</Button>
        </>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* KPI Cards */}
          {kpisLoading ? (
            <ResponsiveGrid cols={4} gap="gap-4" className="mb-6">
              {[0,1,2,3].map(function(i) { return <div key={i} className="surface-card p-4 h-24 skeleton" /> })}
            </ResponsiveGrid>
          ) : kpis && (
            <ResponsiveGrid cols={4} gap="gap-4" className="mb-6">
              <KpiCard label="Ingresos totales"   value={fmtCur(kpis.totalIncome)}  sub={'Este mes: ' + fmtCur(kpis.monthIncome)}  color="#22c55e" icon={TrendingUp}   trend={kpis.incomeTrend} delay={0} />
              <KpiCard label="Gastos totales"     value={fmtCur(kpis.totalExpense)} sub={'Este mes: ' + fmtCur(kpis.monthExpense)} color="#ef4444" icon={TrendingDown} delay={0.06} />
              <KpiCard label="Beneficio neto"     value={fmtCur(kpis.netProfit)}    sub={'Este mes: ' + fmtCur(kpis.monthProfit)}   color={kpis.netProfit >= 0 ? '#22c55e' : '#ef4444'} icon={DollarSign} delay={0.12} />
              <KpiCard label="Facturas pendientes" value={fmtCur(kpis.pendingInv)}  sub="Por cobrar" color="#f59e0b" icon={Clock} delay={0.18} />
            </ResponsiveGrid>
          )}

          {/* Grafica + Ranking */}
          <ResponsiveGrid cols={3} gap="gap-5" className="mb-6">
            <div className="lg:col-span-2 surface-card p-5">
              <h3 className="text-sm font-semibold text-text-1 mb-4">Evolucion ultimos 6 meses</h3>
              {kpis && kpis.sparkline && kpis.sparkline.length > 0 ? (
                <AreaChart
                  data={kpis.sparkline}
                  lines={[
                    { key: 'income',  color: '#22c55e', name: 'Ingresos' },
                    { key: 'expense', color: '#ef4444', name: 'Gastos' },
                  ]}
                  height={200}
                  formatter={function(v) { return fmtCur(v) }}
                />
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '13px' }}>
                  Sin datos suficientes para la grafica
                </div>
              )}
            </div>
            <div className="surface-card p-5">
              <h3 className="text-sm font-semibold text-text-1 mb-4">Ranking de clientes</h3>
              <ClientRanking ranking={ranking} />
            </div>
          </ResponsiveGrid>

          {/* Filtros y tabla */}
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
                  <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Buscar movimiento..." className="input-base pl-8 w-full h-9 text-sm" />
                </div>
                <button
                  type="button"
                  onClick={function() { setShowFilters(function(v) { return !v }) }}
                  className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', showFilters ? 'bg-brand-500/15 text-brand-400 border-brand-500/30' : 'text-text-3 border-border hover:bg-surface-3')}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filtros
                  {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <Button icon={<Plus className="w-3.5 h-3.5" />} size="sm" onClick={openCreate}>Nuevo</Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ResponsiveGrid cols={4} gap="gap-3" className="pt-3">
                      <div>
                        <label className="label-base">Tipo</label>
                        <select value={type} onChange={function(e) { setType(e.target.value) }} style={SI}>
                          <option value="all">Todos los tipos</option>
                          {Object.entries(FINANCE_TYPES).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
                        </select>
                      </div>
                      <div>
                        <label className="label-base">Estado</label>
                        <select value={status} onChange={function(e) { setStatus(e.target.value) }} style={SI}>
                          <option value="all">Todos los estados</option>
                          {Object.entries(FINANCE_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
                        </select>
                      </div>
                      <div>
                        <label className="label-base">Cliente</label>
                        <select value={clientId} onChange={function(e) { setClientId(e.target.value) }} style={SI}>
                          <option value="all">Todos los clientes</option>
                          {selectors.clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option> })}
                        </select>
                      </div>
                      <div>
                        <label className="label-base">Desde</label>
                        <input type="date" value={dateFrom} onChange={function(e) { setDateFrom(e.target.value) }} style={Object.assign({}, SI, { width: '100%' })} />
                      </div>
                      <div>
                        <label className="label-base">Hasta</label>
                        <input type="date" value={dateTo} onChange={function(e) { setDateTo(e.target.value) }} style={Object.assign({}, SI, { width: '100%' })} />
                      </div>
                      <div className="flex items-end">
                        <button type="button"
                          onClick={function() { setType('all'); setStatus('all'); setClientId('all'); setDateFrom(''); setDateTo(''); setSearch('') }}
                          className="text-xs text-text-3 hover:text-text-2 transition-colors"
                        >Limpiar filtros</button>
                      </div>
                    </ResponsiveGrid>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error ? (
              <div className="p-6"><EmptyState icon={AlertTriangle} title="Error al cargar" description={error} size="sm" /></div>
            ) : (
              <EntriesTable entries={entries} onEdit={openEdit} onArchive={handleArchive} loading={loading} />
            )}
          </div>

        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar movimiento' : 'Nuevo movimiento'} size="lg">
        <FinanceForm initial={editing} selectors={selectors} categories={categories} onSave={handleSave} onCancel={closeModal} loading={formLoading} />
      </Modal>

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}
          >{toastMsg.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showArchiveConfirm !== null}
        title="Archivar movimiento"
        message="¿Estás seguro de que deseas archivar este movimiento? No se eliminará, solo se ocultará."
        confirmText="Archivar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={confirmArchive}
        onCancel={() => setShowArchiveConfirm(null)}
      />
    </div>
  )
}

