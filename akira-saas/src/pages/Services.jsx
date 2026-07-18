import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Archive, Edit3, AlertTriangle, Wrench, TrendingUp, Package } from 'lucide-react'
import {
  getServices, createService, updateService, archiveService,
  SERVICE_CATEGORIES,
} from '@/services/services.service'
import PageHeader      from '@/components/layout/PageHeader'
import Modal           from '@/components/ui/Modal'
import Badge           from '@/components/ui/Badge'
import Button          from '@/components/ui/Button'
import EmptyState      from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import clsx            from 'clsx'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES') + '€' }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

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

      <div className="grid grid-cols-2 gap-3">
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

      {/* Preview margen */}
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

      {/* Toggle activo */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-3 border border-border">
        <div>
          <p className="text-sm font-medium text-text-1">Servicio activo</p>
          <p className="text-xs text-text-4">Los servicios inactivos no aparecen en nuevas suscripciones</p>
        </div>
        <button
          type="button"
          onClick={function() { setForm(function(f) { return Object.assign({}, f, { active: !f.active }) }) }}
          style={{
            position: 'relative', width: '38px', height: '22px', borderRadius: '11px',
            background: form.active ? '#6366f1' : '#374151', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: form.active ? '19px' : '3px',
            width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s',
          }} />
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
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
          <button type="button" onClick={function() { onEdit(service) }}
            className="w-7 h-7 rounded-lg hover:bg-surface-4 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
          ><Edit3 className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={function() { onArchive(service.id) }}
            className="w-7 h-7 rounded-lg hover:bg-status-danger/10 flex items-center justify-center text-text-3 hover:text-status-danger transition-colors"
          ><Archive className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {service.description && (
        <p className="text-xs text-text-4 mb-3 truncate-2 leading-relaxed">{service.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-text-1">{fmtCur(price)}</p>
          <p className="text-2xs text-text-4">por {service.unit}</p>
        </div>
        {margin !== null && (
          <div className="text-right">
            <p className={clsx('text-sm font-bold', margin >= 50 ? 'text-status-success' : margin >= 20 ? 'text-status-warning' : 'text-status-danger')}>
              {margin}% margen
            </p>
            <p className="text-2xs text-text-4">coste {fmtCur(cost)}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Services() {
  var [services,    setServices]    = useState([])
  var [loading,     setLoading]     = useState(true)
  var [error,       setError]       = useState(null)
  var [search,      setSearch]      = useState('')
  var [category,    setCategory]    = useState('all')
  var [onlyActive,  setOnlyActive]  = useState(false)
  var [modalOpen,   setModalOpen]   = useState(false)
  var [editing,     setEditing]     = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [toastMsg,    setToastMsg]    = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  function loadServices() {
    setLoading(true)
    setError(null)
    getServices(search, category, onlyActive)
      .then(function(data) { setServices(data); setLoading(false) })
      .catch(function(e) { setError(e.message); setLoading(false) })
  }

  useEffect(function() {
    var t = setTimeout(loadServices, 300)
    return function() { clearTimeout(t) }
  }, [search, category, onlyActive])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(s)  { setEditing(s);   setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSave(form) {
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
        }
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleArchive(id) {
    if (!window.confirm('Archivar este servicio?')) return
    archiveService(id)
      .then(function() {
        setServices(function(prev) { return prev.filter(function(s) { return s.id !== id }) })
        showToast('Servicio archivado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  // KPIs
  var totalIncome = services.reduce(function(s, x) { return s + (Number(x.price) || 0) }, 0)
  var avgMargin   = services.length > 0
    ? Math.round(services.reduce(function(s, x) {
        var p = Number(x.price) || 0; var c = Number(x.cost) || 0
        return s + (p > 0 ? ((p - c) / p) * 100 : 0)
      }, 0) / services.length)
    : 0

  var SI = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Servicios"
        description="Catalogo de servicios y tarifas"
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nuevo servicio</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Package,    label: 'Servicios activos', value: services.filter(function(s) { return s.active }).length, color: 'text-brand-400' },
              { icon: TrendingUp, label: 'Margen promedio',   value: avgMargin + '%', color: avgMargin >= 50 ? 'text-status-success' : 'text-status-warning' },
              { icon: Wrench,     label: 'Total servicios',   value: services.length, color: 'text-text-1' },
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
              <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Buscar servicio..." className="input-base pl-8 w-full h-9 text-sm" />
            </div>
            <select value={category} onChange={function(e) { setCategory(e.target.value) }} style={SI}>
              <option value="all">Todas las categorias</option>
              {SERVICE_CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
            <button
              type="button"
              onClick={function() { setOnlyActive(function(v) { return !v }) }}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border', onlyActive ? 'bg-brand-500/15 text-brand-400 border-brand-500/30' : 'text-text-3 border-border hover:bg-surface-3')}
            >
              Solo activos
            </button>
          </div>

          {/* Grid de servicios */}
          {loading ? (
            <PageSpinner label="Cargando servicios..." />
          ) : error ? (
            <EmptyState icon={AlertTriangle} title="Error al cargar" description={error} />
          ) : services.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Sin servicios"
              description={search ? 'Ningun servicio coincide.' : 'Crea tu primer servicio para empezar.'}
              action={!search && <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Crear servicio</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map(function(s) {
                return (
                  <ServiceCard key={s.id} service={s} onEdit={openEdit} onArchive={handleArchive} />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar servicio' : 'Nuevo servicio'} size="md">
        <ServiceForm initial={editing} onSave={handleSave} onCancel={closeModal} loading={formLoading} />
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