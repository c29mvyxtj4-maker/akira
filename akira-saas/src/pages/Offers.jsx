import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Archive, Edit3, AlertTriangle, Wrench, TrendingUp, Package, CreditCard } from 'lucide-react'
import { ResponsiveGrid } from '@/components/responsive'
import {
  getServices, createService, updateService, archiveService,
  SERVICE_CATEGORIES,
} from '@/services/services.service'
import {
  getSubscriptions, createSubscription, updateSubscription, archiveSubscription,
  getClientsForSelect, getServicesForSelect,
  SUB_PERIODS, SUB_STATUS, calcMonthlyValue,
} from '@/services/subscriptions.service'
import PageHeader      from '@/shared/components/layout/PageHeader'
import Modal           from '@/shared/components/ui/Modal'
import Badge           from '@/shared/components/ui/Badge'
import Button          from '@/shared/components/ui/Button'
import EmptyState      from '@/shared/components/ui/EmptyState'
import { PageSpinner } from '@/shared/components/ui/Spinner'
import clsx            from 'clsx'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES') + '–‚¬' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
function daysLeft(d) { if (!d) return null; return Math.ceil((new Date(d) - Date.now()) / 86400000) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}
var SI = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   CATALOGO (antes Services.jsx)
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
function ServiceForm({ initial, onSave, onCancel, loading }) {
  var EMPTY = { name: '', description: '', category: 'Video', price: '', cost: '', unit: 'proyecto', active: true }
  var [form, setForm] = useState(function() {
    if (!initial) return EMPTY
    return {
      name:        initial.name        || '',
      description: initial.description || '',
      category:    initial.category    || 'Video',
      price:       initial.price       != null ? String(initial.price) : '',
      cost:        initial.cost        != null ? String(initial.cost)  : '',
      unit:        initial.unit        || 'proyecto',
      active:      initial.active !== false,
    }
  })
  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }
  var price  = Number(form.price) || 0
  var cost   = Number(form.cost)  || 0
  var margin = price > 0 ? Math.round(((price - cost) / price) * 100) : null
  return (
    <form onSubmit={function(e) { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }} className="space-y-4">
      <ResponsiveGrid cols={2} gap="gap-3">
        <div className="col-span-2">
          <label className="label-base">Nombre del servicio *</label>
          <input value={form.name} onChange={set('name')} placeholder="Pack de video corporativo" style={INP} />
        </div>
        <div>
          <label className="label-base">Categoría</label>
          <select value={form.category} onChange={set('category')} style={INP}>
            {SERVICE_CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Unidad</label>
          <select value={form.unit} onChange={set('unit')} style={INP}>
            {['proyecto','hora','dia','mes','entrega','sesion','otro'].map(function(u) { return <option key={u} value={u}>{u}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Precio de venta (E)</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0" style={INP} />
        </div>
        <div>
          <label className="label-base">Coste interno (E)</label>
          <input type="number" min="0" step="0.01" value={form.cost} onChange={set('cost')} placeholder="0" style={INP} />
        </div>
        <div className="col-span-2">
          <label className="label-base">Descripción</label>
          <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Que incluye este servicio..." style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
      </div>
      {price > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-3 border border-border">
          <div className="text-center">
            <p className="text-2xs text-text-4">Precio</p>
            <p className="text-sm font-black text-status-success">{fmtCur(price)}</p>
          </div>
          <div className="text-text-4">-</div>
          <div className="text-center">
            <p className="text-2xs text-text-4">Coste</p>
            <p className="text-sm font-black text-status-danger">{fmtCur(cost)}</p>
          </div>
          <div className="text-text-4">=</div>
          <div className="text-center">
            <p className="text-2xs text-text-4">Margen</p>
            <p className={clsx('text-sm font-black', (price - cost) >= 0 ? 'text-status-success' : 'text-status-danger')}>
              {fmtCur(price - cost)} {margin !== null ? '(' + margin + '%)' : ''}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-3 border border-border">
        <div>
          <p className="text-sm font-medium text-text-1">Servicio activo</p>
          <p className="text-xs text-text-4">Los servicios inactivos no aparecen en nuevas suscripciones ni facturas</p>
        </div>
        <button
          type="button"
          onClick={function() { setForm(function(f) { return Object.assign({}, f, { active: !f.active }) }) }}
          style={{ position: 'relative', width: '38px', height: '22px', borderRadius: '11px', background: form.active ? 'var(--brand)' : '#374151', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          <span style={{ position: 'absolute', top: '3px', left: form.active ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </button>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear servicio'}</Button>
      </div>
    </form>
  )
}

function ServiceCard({ service, onEdit, onArchive }) {
  var price  = Number(service.price) || 0
  var cost   = Number(service.cost)  || 0
  var margin = price > 0 ? Math.round(((price - cost) / price) * 100) : null
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="surface-card p-4 hover:shadow-card-hover hover:-translate-y-px transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text-1 truncate">{service.name}</h3>
            {!service.active && <Badge color="default" size="xs">Inactivo</Badge>}
          </div>
          <p className="text-xs text-text-4">{service.category} / {service.unit}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button type="button" onClick={function() { onEdit(service) }} className="w-7 h-7 rounded-lg hover:bg-surface-4 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={function() { onArchive(service.id) }} className="w-7 h-7 rounded-lg hover:bg-status-danger/10 flex items-center justify-center text-text-3 hover:text-status-danger transition-colors"><Archive className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {service.description && <p className="text-xs text-text-4 mb-3 truncate-2 leading-relaxed">{service.description}</p>}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-text-1">{fmtCur(price)}</p>
          <p className="text-2xs text-text-4">por {service.unit}</p>
        </div>
        {margin !== null && (
          <div className="text-right">
            <p className={clsx('text-sm font-bold', margin >= 50 ? 'text-status-success' : margin >= 20 ? 'text-status-warning' : 'text-status-danger')}>{margin}% margen</p>
            <p className="text-2xs text-text-4">coste {fmtCur(cost)}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CatalogTab({ services, loading, error, search, setSearch, category, setCategory, onlyActive, setOnlyActive, onCreate, onEdit, onArchive }) {
  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
          <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Buscar servicio..." className="input-base pl-8 w-full h-9 text-sm" />
        </div>
        <select value={category} onChange={function(e) { setCategory(e.target.value) }} style={SI}>
          <option value="all">Todas las categorias</option>
          {SERVICE_CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
        </select>
        <button type="button" onClick={function() { setOnlyActive(function(v) { return !v }) }}
          className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border', onlyActive ? 'bg-brand-500/15 text-brand-400 border-brand-500/30' : 'text-text-3 border-border hover:bg-surface-3')}
        >Solo activos</button>
      </div>

      {loading ? (
        <PageSpinner label="Cargando servicios..." />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Error al cargar" description={error} />
      ) : services.length === 0 ? (
        <EmptyState icon={Wrench} title="Sin servicios" description={search ? 'Ningun servicio coincide.' : 'Crea tu primer servicio para empezar.'}
          action={!search && <Button onClick={onCreate} icon={<Plus className="w-4 h-4" />}>Crear servicio</Button>}
        />
      ) : (
        <ResponsiveGrid cols={3} gap="gap-4">
          {services.map(function(s) { return <ServiceCard key={s.id} service={s} onEdit={onEdit} onArchive={onArchive} /> })}
        </div>
      )}
    </div>
  )
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   SUSCRIPCIONES (antes Subscriptions.jsx)
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
function SubForm({ initial, clients, services, onSave, onCancel, loading }) {
  var EMPTY = { name: '', client_id: '', service_id: '', price: '', period: 'monthly', status: 'active', start_date: '', next_billing: '', notes: '' }
  var [form, setForm] = useState(function() {
    if (!initial) return EMPTY
    return {
      name:        initial.name        || '',
      client_id:   initial.client_id   || '',
      service_id:  initial.service_id  || '',
      price:       initial.price       != null ? String(initial.price) : '',
      period:      initial.period      || 'monthly',
      status:      initial.status      || 'active',
      start_date:  initial.start_date  || '',
      next_billing: initial.next_billing || '',
      notes:       initial.notes       || '',
    }
  })
  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }
  function handleServiceChange(e) {
    var sid = e.target.value
    setForm(function(f) {
      var svc = services.find(function(s) { return s.id === sid })
      return Object.assign({}, f, { service_id: sid, price: svc && svc.price != null ? String(svc.price) : f.price, period: svc && svc.period ? svc.period : f.period })
    })
  }
  var monthly = calcMonthlyValue(form.price, form.period)
  return (
    <form onSubmit={function(e) { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }} className="space-y-4">
      <ResponsiveGrid cols={2} gap="gap-3">
        <div className="col-span-2">
          <label className="label-base">Nombre de la suscripcion *</label>
          <input value={form.name} onChange={set('name')} placeholder="Pack mensual video" style={INP} />
        </div>
        <div>
          <label className="label-base">Cliente</label>
          <select value={form.client_id} onChange={set('client_id')} style={INP}>
            <option value="">Sin cliente</option>
            {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}{c.company ? ' - ' + c.company : ''}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Servicio base</label>
          <select value={form.service_id} onChange={handleServiceChange} style={INP}>
            <option value="">Sin servicio</option>
            {services.map(function(s) { return <option key={s.id} value={s.id}>{s.name}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Precio</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0" style={INP} />
        </div>
        <div>
          <label className="label-base">Periodo</label>
          <select value={form.period} onChange={set('period')} style={INP}>
            {Object.entries(SUB_PERIODS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Estado</label>
          <select value={form.status} onChange={set('status')} style={INP}>
            {Object.entries(SUB_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Fecha inicio</label>
          <input type="date" value={form.start_date} onChange={set('start_date')} style={INP} />
        </div>
        <div>
          <label className="label-base">Próximo cobro</label>
          <input type="date" value={form.next_billing} onChange={set('next_billing')} style={INP} />
        </div>
        <div className="col-span-2">
          <label className="label-base">Notas</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Notas adicionales..." style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
      </div>
      {Number(form.price) > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-3 border border-border">
          <div>
            <p className="text-xs text-text-4">Precio {SUB_PERIODS[form.period] ? SUB_PERIODS[form.period].label.toLowerCase() : ''}</p>
            <p className="text-lg font-black text-text-1">{fmtCur(form.price)}</p>
          </div>
          <div className="text-text-4 text-sm">=</div>
          <div className="text-right">
            <p className="text-xs text-text-4">Equivale a / mes (MRR)</p>
            <p className="text-lg font-black text-status-success">{fmtCur(monthly)}</p>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear suscripcion'}</Button>
      </div>
    </form>
  )
}

function SubCard({ sub, onEdit, onArchive }) {
  var stCfg   = SUB_STATUS[sub.status]
  var monthly = calcMonthlyValue(sub.price, sub.period)
  var days    = daysLeft(sub.next_billing)
  var isDue   = days !== null && days <= 7 && sub.status === 'active'
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={clsx('surface-card p-4 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px', isDue && 'border-status-warning/30')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text-1 truncate">{sub.name}</h3>
            {stCfg && <Badge color={stCfg.color} size="xs">{stCfg.label}</Badge>}
          </div>
          <p className="text-xs text-text-4 truncate">
            {sub.clients ? (sub.clients.company || sub.clients.name) : 'Sin cliente'}
            {sub.services ? ' / ' + sub.services.name : ''}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button type="button" onClick={function() { onEdit(sub) }} className="w-7 h-7 rounded-lg hover:bg-surface-4 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={function() { onArchive(sub.id) }} className="w-7 h-7 rounded-lg hover:bg-status-danger/10 flex items-center justify-center text-text-3 hover:text-status-danger transition-colors"><Archive className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-black text-text-1">{fmtCur(sub.price)}</p>
          <p className="text-2xs text-text-4">{SUB_PERIODS[sub.period] ? SUB_PERIODS[sub.period].label.toLowerCase() : sub.period} = {fmtCur(monthly)}/mes</p>
        </div>
        <div className="text-right">
          {sub.next_billing && (
            <div>
              <p className={clsx('text-xs font-semibold', isDue ? 'text-status-warning' : 'text-text-3')}>{isDue ? 'Vence en ' + days + 'd' : fmtDate(sub.next_billing)}</p>
              <p className="text-2xs text-text-4">proximo cobro</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SubscriptionsTab({ subs, clients, loading, error, search, setSearch, status, setStatus, clientId, setClientId, onCreate, onEdit, onArchive }) {
  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
          <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Buscar suscripcion..." className="input-base pl-8 w-full h-9 text-sm" />
        </div>
        <select value={status} onChange={function(e) { setStatus(e.target.value) }} style={SI}>
          <option value="all">Todos los estados</option>
          {Object.entries(SUB_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
        </select>
        <select value={clientId} onChange={function(e) { setClientId(e.target.value) }} style={SI}>
          <option value="all">Todos los clientes</option>
          {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option> })}
        </select>
      </div>

      {loading ? (
        <PageSpinner label="Cargando suscripciones..." />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Error al cargar" description={error} />
      ) : subs.length === 0 ? (
        <EmptyState icon={CreditCard} title="Sin suscripciones" description={search ? 'Ninguna suscripcion coincide.' : 'Crea tu primera suscripcion recurrente.'}
          action={!search && <Button onClick={onCreate} icon={<Plus className="w-4 h-4" />}>Crear suscripcion</Button>}
        />
      ) : (
        <ResponsiveGrid cols={3} gap="gap-4">
          {subs.map(function(s) { return <SubCard key={s.id} sub={s} onEdit={onEdit} onArchive={onArchive} /> })}
        </div>
      )}
    </div>
  )
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   PAGINA PRINCIPAL –” OFERTAS
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
export default function Offers() {
  var [tab, setTab] = useState('catalog') // 'catalog' | 'subscriptions'

  // Catalogo
  var [services,      setServices]      = useState([])
  var [svcLoading,    setSvcLoading]    = useState(true)
  var [svcError,      setSvcError]      = useState(null)
  var [svcSearch,     setSvcSearch]     = useState('')
  var [svcCategory,   setSvcCategory]   = useState('all')
  var [onlyActive,    setOnlyActive]    = useState(false)

  // Suscripciones
  var [subs,          setSubs]          = useState([])
  var [clients,        setClients]       = useState([])
  var [selectServices, setSelectServices] = useState([])
  var [subLoading,     setSubLoading]     = useState(true)
  var [subError,       setSubError]       = useState(null)
  var [subSearch,      setSubSearch]      = useState('')
  var [subStatus,      setSubStatus]      = useState('all')
  var [subClientId,    setSubClientId]    = useState('all')

  // Modal compartido
  var [modalOpen,   setModalOpen]   = useState(false)
  var [editing,     setEditing]     = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [toastMsg,    setToastMsg]    = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  useEffect(function() {
    getClientsForSelect().then(setClients).catch(function() {})
    getServicesForSelect().then(setSelectServices).catch(function() {})
  }, [])

  function loadServices() {
    setSvcLoading(true)
    setSvcError(null)
    getServices(svcSearch, svcCategory, onlyActive)
      .then(function(data) { setServices(data); setSvcLoading(false) })
      .catch(function(e) { setSvcError(e.message); setSvcLoading(false) })
  }
  useEffect(function() {
    var t = setTimeout(loadServices, 300)
    return function() { clearTimeout(t) }
  }, [svcSearch, svcCategory, onlyActive])

  function loadSubs() {
    setSubLoading(true)
    setSubError(null)
    getSubscriptions(subSearch, subStatus, subClientId)
      .then(function(data) { setSubs(data); setSubLoading(false) })
      .catch(function(e) { setSubError(e.message); setSubLoading(false) })
  }
  useEffect(function() {
    var t = setTimeout(loadSubs, 300)
    return function() { clearTimeout(t) }
  }, [subSearch, subStatus, subClientId])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(item) { setEditing(item); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSaveService(form) {
    setFormLoading(true)
    var promise = editing ? updateService(editing.id, form) : createService(form)
    promise
      .then(function(saved) {
        if (editing) {
          setServices(function(prev) { return prev.map(function(s) { return s.id === saved.id ? saved : s }) })
          showToast('Servicio actualizado')
        } else {
          setServices(function(prev) { return [saved].concat(prev) })
          showToast('Servicio creado')
          getServicesForSelect().then(setSelectServices).catch(function() {})
        }
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleArchiveService(id) {
    if (!window.confirm('Archivar este servicio?')) return
    archiveService(id)
      .then(function() {
        setServices(function(prev) { return prev.filter(function(s) { return s.id !== id }) })
        showToast('Servicio archivado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleSaveSub(form) {
    setFormLoading(true)
    var promise = editing ? updateSubscription(editing.id, form) : createSubscription(form)
    promise
      .then(function(saved) {
        if (editing) {
          setSubs(function(prev) { return prev.map(function(s) { return s.id === saved.id ? saved : s }) })
          showToast('Suscripcion actualizada')
        } else {
          setSubs(function(prev) { return [saved].concat(prev) })
          showToast('Suscripcion creada')
        }
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleArchiveSub(id) {
    if (!window.confirm('Archivar esta suscripcion?')) return
    archiveSubscription(id)
      .then(function() {
        setSubs(function(prev) { return prev.filter(function(s) { return s.id !== id }) })
        showToast('Suscripcion archivada')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  // KPIs combinados
  var activeSubs = subs.filter(function(s) { return s.status === 'active' })
  var mrr        = activeSubs.reduce(function(sum, s) { return sum + calcMonthlyValue(s.price, s.period) }, 0)
  var arr        = mrr * 12
  var dueSoon    = subs.filter(function(s) { var d = daysLeft(s.next_billing); return d !== null && d <= 7 && s.status === 'active' }).length
  var avgMargin  = services.length > 0
    ? Math.round(services.reduce(function(s, x) {
        var p = Number(x.price) || 0; var c = Number(x.cost) || 0
        return s + (p > 0 ? ((p - c) / p) * 100 : 0)
      }, 0) / services.length)
    : 0

  var TABS = [
    { id: 'catalog',       label: 'Catalogo (' + services.length + ')' },
    { id: 'subscriptions', label: 'Suscripciones (' + subs.length + ')' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Ofertas"
        description="Lo que vendes, y quien lo tiene contratado"
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>{tab === 'catalog' ? 'Nuevo servicio' : 'Nueva suscripcion'}</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* KPIs combinados */}
          <ResponsiveGrid cols={4} gap="gap-4" className="mb-6">
            {[
              { icon: Package,       label: 'Servicios activos',    value: services.filter(function(s) { return s.active }).length, color: 'text-brand-400' },
              { icon: TrendingUp,    label: 'Margen promedio',      value: avgMargin + '%',       color: avgMargin >= 50 ? 'text-status-success' : 'text-status-warning' },
              { icon: CreditCard,    label: 'MRR',                  value: fmtCur(mrr) + '/mes', color: 'text-status-success' },
              { icon: AlertTriangle, label: 'Renuevan en 7 dias',   value: dueSoon,                color: dueSoon > 0 ? 'text-status-warning' : 'text-text-3' },
            ].map(function(k, i) {
              var Icon = k.icon
              return (
                <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="surface-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center flex-shrink-0">
                    <Icon className={clsx('w-5 h-5', k.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-text-4 mb-0.5">{k.label}</p>
                    <p className={clsx('text-xl font-black', k.color)}>{k.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pestañas */}
          <div className="flex gap-1 mb-5 bg-surface-3 rounded-lg p-1 w-fit">
            {TABS.map(function(t) {
              return (
                <button key={t.id} type="button" onClick={function() { setTab(t.id) }}
                  className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150', tab === t.id ? 'bg-surface-5 text-text-1 shadow-sm' : 'text-text-3 hover:text-text-2')}
                >{t.label}</button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'catalog' ? (
              <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <CatalogTab
                  services={services} loading={svcLoading} error={svcError}
                  search={svcSearch} setSearch={setSvcSearch}
                  category={svcCategory} setCategory={setSvcCategory}
                  onlyActive={onlyActive} setOnlyActive={setOnlyActive}
                  onCreate={openCreate} onEdit={openEdit} onArchive={handleArchiveService}
                />
              </motion.div>
            ) : (
              <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <SubscriptionsTab
                  subs={subs} clients={clients} loading={subLoading} error={subError}
                  search={subSearch} setSearch={setSubSearch}
                  status={subStatus} setStatus={setSubStatus}
                  clientId={subClientId} setClientId={setSubClientId}
                  onCreate={openCreate} onEdit={openEdit} onArchive={handleArchiveSub}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal}
        title={tab === 'catalog' ? (editing ? 'Editar servicio' : 'Nuevo servicio') : (editing ? 'Editar suscripcion' : 'Nueva suscripcion')}
        size="md"
      >
        {tab === 'catalog' ? (
          <ServiceForm initial={editing} onSave={handleSaveService} onCancel={closeModal} loading={formLoading} />
        ) : (
          <SubForm initial={editing} clients={clients} services={selectServices} onSave={handleSaveSub} onCancel={closeModal} loading={formLoading} />
        )}
      </Modal>

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}
          >{toastMsg.msg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
