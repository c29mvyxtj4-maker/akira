import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Archive, Edit3, AlertTriangle, CreditCard, TrendingUp, Users } from 'lucide-react'
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

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES') + 'â‚¬' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
function daysLeft(d) { if (!d) return null; return Math.ceil((new Date(d) - Date.now()) / 86400000) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

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

  // Auto-rellenar precio desde servicio seleccionado
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
      <div className="grid grid-cols-2 gap-3">
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
          <label className="label-base">PrÃ³ximo cobro</label>
          <input type="date" value={form.next_billing} onChange={set('next_billing')} style={INP} />
        </div>
        <div className="col-span-2">
          <label className="label-base">Notas</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Notas adicionales..." style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
      </div>

      {/* Preview MRR */}
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
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
          <button type="button" onClick={function() { onEdit(sub) }}
            className="w-7 h-7 rounded-lg hover:bg-surface-4 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
          ><Edit3 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={function() { onArchive(sub.id) }}
            className="w-7 h-7 rounded-lg hover:bg-status-danger/10 flex items-center justify-center text-text-3 hover:text-status-danger transition-colors"
          ><Archive className="w-3.5 h-3.5" /></button>
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
              <p className={clsx('text-xs font-semibold', isDue ? 'text-status-warning' : 'text-text-3')}>
                {isDue ? 'Vence en ' + days + 'd' : fmtDate(sub.next_billing)}
              </p>
              <p className="text-2xs text-text-4">proximo cobro</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Subscriptions() {
  var [subs,        setSubs]        = useState([])
  var [clients,     setClients]     = useState([])
  var [services,    setServices]    = useState([])
  var [loading,     setLoading]     = useState(true)
  var [error,       setError]       = useState(null)
  var [search,      setSearch]      = useState('')
  var [status,      setStatus]      = useState('all')
  var [clientId,    setClientId]    = useState('all')
  var [modalOpen,   setModalOpen]   = useState(false)
  var [editing,     setEditing]     = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [toastMsg,    setToastMsg]    = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  useEffect(function() {
    getClientsForSelect().then(function(d) { setClients(d) }).catch(function() {})
    getServicesForSelect().then(function(d) { setServices(d) }).catch(function() {})
  }, [])

  function loadSubs() {
    setLoading(true)
    setError(null)
    getSubscriptions(search, status, clientId)
      .then(function(data) { setSubs(data); setLoading(false) })
      .catch(function(e) { setError(e.message); setLoading(false) })
  }

  useEffect(function() {
    var t = setTimeout(loadSubs, 300)
    return function() { clearTimeout(t) }
  }, [search, status, clientId])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(s)  { setEditing(s);   setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSave(form) {
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

  function handleArchive(id) {
    if (!window.confirm('Archivar esta suscripcion?')) return
    archiveSubscription(id)
      .then(function() {
        setSubs(function(prev) { return prev.filter(function(s) { return s.id !== id }) })
        showToast('Suscripcion archivada')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  // KPIs
  var activeSubs = subs.filter(function(s) { return s.status === 'active' })
  var mrr        = activeSubs.reduce(function(sum, s) { return sum + calcMonthlyValue(s.price, s.period) }, 0)
  var arr        = mrr * 12
  var dueSoon    = subs.filter(function(s) { var d = daysLeft(s.next_billing); return d !== null && d <= 7 && s.status === 'active' }).length

  var SI = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Suscripciones"
        description="Contratos recurrentes y MRR"
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nueva suscripcion</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { icon: CreditCard,  label: 'Suscripciones activas', value: activeSubs.length,        color: 'text-brand-400' },
              { icon: TrendingUp,  label: 'MRR',                   value: fmtCur(mrr) + '/mes',    color: 'text-status-success' },
              { icon: TrendingUp,  label: 'ARR',                   value: fmtCur(arr) + '/ano',    color: 'text-status-info' },
              { icon: AlertTriangle, label: 'Vencen en 7 dias',    value: dueSoon,                  color: dueSoon > 0 ? 'text-status-warning' : 'text-text-3' },
            ].map(function(k, i) {
              var Icon = k.icon
              return (
                <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="surface-card p-4 flex items-center gap-4">
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

          {/* Filtros */}
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

          {/* Grid */}
          {loading ? (
            <PageSpinner label="Cargando suscripciones..." />
          ) : error ? (
            <EmptyState icon={AlertTriangle} title="Error al cargar" description={error} />
          ) : subs.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Sin suscripciones"
              description={search ? 'Ninguna suscripcion coincide.' : 'Crea tu primera suscripcion recurrente.'}
              action={!search && <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Crear suscripcion</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {subs.map(function(s) {
                return <SubCard key={s.id} sub={s} onEdit={openEdit} onArchive={handleArchive} />
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar suscripcion' : 'Nueva suscripcion'} size="md">
        <SubForm initial={editing} clients={clients} services={services} onSave={handleSave} onCancel={closeModal} loading={formLoading} />
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

