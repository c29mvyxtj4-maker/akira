import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, UserPlus, Archive,
  Edit3, ChevronRight, ChevronLeft, Phone, Mail, Globe,
  Instagram, TrendingUp, FolderKanban, AlertTriangle,
  Clock, CalendarCheck, Users, UserCheck, FileText, Download,
} from 'lucide-react'
import { exportToCsv } from '@/utils/exportCsv'
import { useClients } from '@/shared/hooks/useClients'
import { useAddRecent } from '@/shared/hooks/useAddRecent'
import { useCurrentItem } from '@/shared/context/CurrentItemContext'
import { CLIENT_NICHES } from '@/services/clients.service'
import { CLIENT_STATUS, PROJECT_STATUS } from '@/config/constants'
import { getEmailTemplates, buildTemplateMailto } from '@/services/templates.service'
import PageHeader      from '@/shared/components/layout/PageHeader'
import Modal           from '@/shared/components/ui/Modal'
import Badge           from '@/shared/components/ui/Badge'
import Button          from '@/shared/components/ui/Button'
import Avatar          from '@/shared/components/ui/Avatar'
import EmptyState      from '@/shared/components/ui/EmptyState'
import { PageSpinner } from '@/shared/components/ui/Spinner'
import { SkeletonCard } from '@/shared/components/ui/Skeleton'
import Select          from '@/shared/components/ui/Select'
import ClientForm      from '@/components/clients/ClientForm'
import ClientTimeline  from '@/components/clients/ClientTimeline'
import clsx            from 'clsx'
import {
  getPortalUsers, createPortalUser, deletePortalUser,
  updatePortalPermission, sendPortalInvite,
  getPortalMessages, sendOwnerMessage,
  getPortalFiles, uploadPortalFile, deletePortalFile,
  getPortalApprovals, createPortalApproval, updatePortalApproval, deletePortalApproval,
} from '@/services/portal.service'
import PortalTab from '@/components/clients/PortalTab'

/* helpers */
function fmtDate(d, opts) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', opts || {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
function fmtCur(n) {
  return (Number(n) || 0).toLocaleString('es-ES') + 'â‚¬'
}
function incomeSign(type) {
  return ['income', 'payment'].includes(type) ? '+' : '-'
}

const SOURCES = {
  referral:      'Referido',
  instagram:     'Instagram',
  web:           'Web',
  networking:    'Networking',
  cold_outreach: 'Outreach frio',
  event:         'Evento',
  other:         'Otro',
  unknown:       'Desconocido',
}

/* â”€â”€ Boton "Plantilla de email" con menu desplegable â”€â”€â”€â”€â”€â”€â”€â”€ */
function EmailTemplateButton({ client }) {
  var [open, setOpen] = useState(false)
  var [templates, setTemplates] = useState([])
  var [loaded, setLoaded] = useState(false)
  var boxRef = useRef(null)

  useEffect(function() {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return function() { document.removeEventListener('mousedown', onClickOutside) }
  }, [])

  function handleOpen() {
    setOpen(function(v) { return !v })
    if (!loaded) {
      getEmailTemplates().then(function(data) { setTemplates(data); setLoaded(true) }).catch(function() { setLoaded(true) })
    }
  }

  function handlePick(t) {
    var url = buildTemplateMailto(t, client)
    if (!url) {
      window.alert('Este cliente no tiene email guardado.')
      return
    }
    window.location.href = url
    setOpen(false)
  }

  if (!client.email) return null

  return (
    <div style={{ position: 'relative' }} ref={boxRef}>
      <button type="button" onClick={handleOpen}
        className="flex items-center gap-1 text-xs text-text-3 hover:text-brand-400 transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <FileText className="w-3 h-3" />
        Plantilla de email
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '240px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-modal)', zIndex: 50, overflow: 'hidden' }}>
          {!loaded ? (
            <div style={{ padding: '14px', fontSize: '12px', color: 'var(--text-4)', textAlign: 'center' }}>Cargando...</div>
          ) : templates.length === 0 ? (
            <div style={{ padding: '14px', fontSize: '12px', color: 'var(--text-4)', textAlign: 'center' }}>
              Sin plantillas todavia.<br />Crea una en Configuracion â†’ Plantillas.
            </div>
          ) : (
            templates.map(function(t) {
              return (
                <button key={t.id} type="button" onClick={function() { handlePick(t) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '12px', color: 'var(--text-1)' }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-3)' }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = 'none' }}
                >{t.name}</button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

/* StatusBar */
function StatusBar({ status }) {
  const STEPS = [
    { key: 'lead',    color: '#6366f1' },
    { key: 'active',  color: '#22c55e' },
    { key: 'at_risk', color: '#ef4444' },
    { key: 'paused',  color: '#f59e0b' },
    { key: 'lost',    color: '#374151' },
  ]
  return (
    <div className="flex gap-1 mt-1.5">
      {STEPS.map(s => (
        <div
          key={s.key}
          className="h-0.5 flex-1 rounded-full transition-opacity duration-300"
          style={{ background: s.color, opacity: s.key === status ? 1 : 0.2 }}
        />
      ))}
    </div>
  )
}

/* ClientKpis */
function ClientKpis({ clients }) {
  const active = clients.filter(c => c.status === 'active').length
  const leads  = clients.filter(c => c.status === 'lead').length
  const atRisk = clients.filter(c => c.status === 'at_risk').length
  const mrv    = clients.reduce((s, c) => s + (Number(c.monthly_value) || 0), 0)

  const items = [
    { label: 'Activos',   value: active,                              icon: UserCheck,     color: 'text-status-success', bg: 'bg-status-success/10' },
    { label: 'Leads',     value: leads,                               icon: Users,         color: 'text-brand-400',      bg: 'bg-brand-500/10' },
    { label: 'En riesgo', value: atRisk,                              icon: AlertTriangle, color: 'text-status-danger',  bg: 'bg-status-danger/10' },
    { label: 'MRV total', value: mrv.toLocaleString('es-ES') + 'â‚¬',  icon: TrendingUp,    color: 'text-status-warning', bg: 'bg-status-warning/10' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 p-3 border-b border-border">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-2.5 flex items-center gap-2"
          >
            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', item.bg)}>
              <Icon className={clsx('w-3.5 h-3.5', item.color)} />
            </div>
            <div>
              <p className="text-sm font-black text-text-1 leading-none">{item.value}</p>
              <p className="text-2xs text-text-4 mt-0.5">{item.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ClientCard */
function ClientCard({ client, isSelected, onClick }) {
  const cfg = CLIENT_STATUS[client.status]
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={clsx(
        'w-full text-left px-3 py-3 rounded-lg border transition-all duration-150',
        isSelected
          ? 'bg-brand-500/10 border-brand-500/30'
          : 'bg-transparent border-transparent hover:bg-surface-3 hover:border-border'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={client.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-text-1 truncate">{client.name}</span>
            {cfg && <Badge color={cfg.color} size="xs">{cfg.label}</Badge>}
          </div>
          <p className="text-xs text-text-4 truncate">
            {client.company || client.email || '--'}
          </p>
          <StatusBar status={client.status} />
          {(Number(client.monthly_value) || 0) > 0 && (
            <p className="text-2xs text-text-4 mt-1">
              {fmtCur(client.monthly_value)}/mes
            </p>
          )}
        </div>
      </div>
    </motion.button>
  )
}

/* ProjectRow */
function ProjectRow({ project }) {
  const cfg   = PROJECT_STATUS[project.status]
  const tasks = Array.isArray(project.tasks) ? project.tasks : []
  const done  = tasks.filter(t => t.done).length
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-1 truncate font-medium">{project.name}</p>
        <p className="text-xs text-text-4 mt-0.5">
          {tasks.length > 0 ? done + '/' + tasks.length + ' tareas' : 'Sin tareas'}
          {project.due_date ? ' - Entrega ' + fmtDate(project.due_date) : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {(Number(project.budget) || 0) > 0 && (
          <span className="text-xs font-semibold text-text-2">{fmtCur(project.budget)}</span>
        )}
        {cfg && <Badge color={cfg.color} size="xs">{cfg.label}</Badge>}
      </div>
    </div>
  )
}

/* ClientDetail */
function ClientDetail({ client, timeline, projects, finance, loading, onEdit, onArchive, onAddEntry, onDeleteEntry, onBack }) {
  const [tab, setTab] = useState('overview')

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <PageSpinner label="Cargando ficha..." />
      </div>
    )
  }

  if (!client) {
    return (
      <EmptyState
        icon={ChevronRight}
        title="Selecciona un cliente"
        description="Haz clic en cualquier cliente de la lista para ver su ficha completa."
        className="flex-1 h-full"
      />
    )
  }

  const cfg       = CLIENT_STATUS[client.status]
  const hasFollow = client.next_followup_at && new Date(client.next_followup_at) > new Date()
  const followDue = client.next_followup_at && new Date(client.next_followup_at) < new Date()

  const TABS = [
   { id: 'overview',  label: 'Resumen' },
   { id: 'timeline',  label: 'Timeline (' + timeline.length + ')' },
   { id: 'projects',  label: 'Proyectos (' + projects.length + ')' },
   { id: 'finance',   label: 'Finanzas' },
   { id: 'portal',    label: 'Portal' },
]

  // Contexto para Akira â€” calculado aqui, dentro de ClientDetail, donde "client" si existe
  var akiraContext = [
    'Cliente: ' + client.name + (client.company ? ' (' + client.company + ')' : ''),
    'Estado: ' + (cfg ? cfg.label : client.status),
    client.monthly_value > 0 ? 'Valor mensual: ' + client.monthly_value + 'â‚¬' : null,
    client.niche ? 'Nicho: ' + client.niche : null,
    'Proyectos vinculados: ' + projects.length,
    finance ? 'Ingresos totales de este cliente: ' + fmtCur(finance.income) : null,
    finance ? 'Beneficio de este cliente: ' + fmtCur(finance.profit) : null,
    client.last_contact_at ? 'Ultimo contacto: ' + fmtDate(client.last_contact_at) : 'Sin fecha de ultimo contacto registrada',
    client.notes ? 'Notas: ' + client.notes : null,
  ].filter(Boolean).join('\n')

  return (
    <motion.div
      key={client.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-5 border-b border-border bg-surface-1">

        {/* BotÃ³n volver, solo en mÃ³vil */}
        <button
          type="button"
          onClick={onBack}
          className="md:hidden mb-4 flex items-center gap-1 text-xs text-text-3 hover:text-text-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a clientes
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={client.name} size="xl" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-text-1">{client.name}</h2>
                {cfg && <Badge color={cfg.color}>{cfg.label}</Badge>}
              </div>
              <p className="text-sm text-text-3">{client.company || 'Sin empresa'}</p>
              {client.niche && (
                <p className="text-xs text-text-4 mt-0.5">{client.niche}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {client.email && (
                  <a href={'mailto:' + client.email} className="flex items-center gap-1 text-xs text-text-3 hover:text-brand-400 transition-colors">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={'tel:' + client.phone} className="flex items-center gap-1 text-xs text-text-3 hover:text-brand-400 transition-colors">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </a>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-text-3 hover:text-brand-400 transition-colors">
                    <Globe className="w-3 h-3" />
                    Web
                  </a>
                )}
                {client.instagram && (
                  <a href={'https://instagram.com/' + client.instagram.replace('@', '')} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-text-3 hover:text-brand-400 transition-colors">
                    <Instagram className="w-3 h-3" />
                    {client.instagram}
                  </a>
                )}
                <EmailTemplateButton client={client} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
            <Button variant="secondary" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => onEdit(client)}>
              Editar
            </Button>
            <Button variant="danger" size="sm" icon={<Archive className="w-3.5 h-3.5" />} onClick={() => onArchive(client.id)}>
              Archivar
            </Button>
          </div>
        </div>

        {followDue && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-status-danger/10 border border-status-danger/20 rounded-lg text-xs text-status-danger">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Seguimiento vencido: {fmtDate(client.next_followup_at)}
          </div>
        )}
        {hasFollow && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-brand-500/10 border border-brand-500/20 rounded-lg text-xs text-brand-400">
            <CalendarCheck className="w-3.5 h-3.5 flex-shrink-0" />
            Proximo seguimiento: {fmtDate(client.next_followup_at)}
          </div>
        )}

        <div className="flex gap-1 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex-shrink-0',
                tab === t.id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                  : 'text-text-3 hover:text-text-2 hover:bg-surface-3'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <AnimatePresence mode="wait">

          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

              {finance && (
                <div>
                  <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Economico</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Ingresos',  value: fmtCur(finance.income),  color: 'text-status-success' },
                      { label: 'Gastos',    value: fmtCur(finance.expense), color: 'text-status-danger' },
                      { label: 'Beneficio', value: fmtCur(finance.profit),  color: finance.profit >= 0 ? 'text-status-success' : 'text-status-danger' },
                    ].map(s => (
                      <div key={s.label} className="surface-card p-3">
                        <p className="text-2xs text-text-4 mb-1">{s.label}</p>
                        <p className={clsx('text-base font-black', s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {finance.pending > 0 && (
                    <div className="mt-2 px-3 py-2 bg-status-warning/10 border border-status-warning/20 rounded-lg flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-status-warning flex-shrink-0" />
                      <span className="text-xs text-status-warning">
                        {fmtCur(finance.pending)} en facturas pendientes
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">InformaciÃ³n</h4>
                <div className="surface-card divide-y divide-border">
                  {[
                    ['Origen',          SOURCES[client.source] || '--'],
                    ['Valor mensual',   client.monthly_value > 0 ? fmtCur(client.monthly_value) : '--'],
                    ['Ultimo contacto', fmtDate(client.last_contact_at)],
                    ['Cliente desde',   fmtDate(client.created_at)],
                  ].map(function(row) {
                    return (
                      <div key={row[0]} className="flex justify-between items-center px-3 py-2.5">
                        <span className="text-xs text-text-4">{row[0]}</span>
                        <span className="text-xs text-text-1 font-medium">{row[1]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {client.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Notas</h4>
                  <div className="surface-card p-4">
                    <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClientTimeline timeline={timeline} onAdd={onAddEntry} onDelete={onDeleteEntry} />
            </motion.div>
          )}

          {tab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">
                Proyectos ({projects.length})
              </h4>
              {projects.length === 0 ? (
                <EmptyState icon={FolderKanban} title="Sin proyectos" description="Este cliente no tiene proyectos vinculados." size="sm" />
              ) : (
                <div className="surface-card divide-y divide-border">
                  {projects.map(p => <ProjectRow key={p.id} project={p} />)}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Movimientos</h4>
              {!finance || finance.entries.length === 0 ? (
                <EmptyState icon={TrendingUp} title="Sin movimientos" description="No hay entradas financieras vinculadas a este cliente." size="sm" />
              ) : (
                <div className="surface-card divide-y divide-border">
                  {finance.entries.slice(0, 20).map(function(e, i) {
                    const isIncome = ['income', 'payment'].includes(e.type)
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-1 truncate">{e.description}</p>
                          <p className="text-2xs text-text-4 mt-0.5">{fmtDate(e.entry_date)}</p>
                        </div>
                        <span className={clsx('text-sm font-bold flex-shrink-0 ml-3', isIncome ? 'text-status-success' : 'text-status-danger')}>
                          {isIncome ? '+' : '-'}{fmtCur(e.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'portal' && (
            <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PortalTab client={client} />
            </motion.div>
   )}

        </AnimatePresence>
      </div>

    </motion.div>
  )
}

/* PAGINA PRINCIPAL */
export default function Clients() {
  const {
    clients, loading, error,
    search, setSearch,
    status, setStatus,
    niche,  setNiche,
    sortBy, setSortBy,
    sortDir, setSortDir,
    selectedId, setSelectedId,
    detail, detailLoading, timeline, relProjects, finance,
    modalOpen, editing, formLoading,
    openCreate, openEdit, closeModal, handleSave,
    handleArchive, handleAddEntry, handleDeleteEntry,
    toastMsg,
  } = useClients()
  const { addRecent } = useAddRecent()
  const { setCurrentItem } = useCurrentItem()

  const [showFilters, setShowFilters] = useState(false)

  function handleExport() {
    if (!clients.length) return
    const columns = [
      { key: 'name',          label: 'Nombre' },
      { key: 'company',       label: 'Empresa' },
      { key: 'email',         label: 'Email' },
      { key: 'phone',         label: 'TelÃ©fono' },
      { key: 'status_label',  label: 'Estado' },
      { key: 'niche',         label: 'Nicho' },
      { key: 'source',        label: 'Origen' },
      { key: 'monthly_value', label: 'Valor mensual (â‚¬)' },
    ]
    const rows = clients.map(c => ({
      name:          c.name || '',
      company:       c.company || '',
      email:         c.email || '',
      phone:         c.phone || '',
      status_label:  (CLIENT_STATUS[c.status] && CLIENT_STATUS[c.status].label) || c.status || '',
      niche:         c.niche || '',
      source:        SOURCES[c.source] || c.source || '',
      monthly_value: Number(c.monthly_value) || 0,
    }))
    exportToCsv('clientes_' + new Date().toISOString().slice(0, 10), columns, rows)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Clientes"
        description={clients.length + ' cliente' + (clients.length !== 1 ? 's' : '')}
        actions={
          <>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport} disabled={!clients.length}>
              Exportar CSV
            </Button>
            <Button icon={<UserPlus className="w-4 h-4" />} onClick={openCreate}>
              Nuevo cliente
            </Button>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR â€” en mÃ³vil ocupa toda la pantalla y se oculta al seleccionar un cliente */}
        <div className={clsx(
          'w-full md:w-72 flex-shrink-0 flex-col border-r border-border bg-surface-1 overflow-hidden',
          selectedId ? 'hidden md:flex' : 'flex'
        )}>

          <ClientKpis clients={clients} />

          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="input-base pl-8 w-full h-8 text-xs"
              />
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors w-full"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
              <ChevronRight className={clsx('w-3 h-3 ml-auto transition-transform duration-200', showFilters && 'rotate-90')} />
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <Select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      size="sm"
                      options={[
                        { value: 'all',     label: 'Todos los estados' },
                        { value: 'lead',    label: 'Lead' },
                        { value: 'active',  label: 'Activo' },
                        { value: 'at_risk', label: 'En riesgo' },
                        { value: 'paused',  label: 'Pausado' },
                        { value: 'lost',    label: 'Perdido' },
                      ]}
                    />
                    <Select
                      value={niche}
                      onChange={e => setNiche(e.target.value)}
                      size="sm"
                      options={[
                        { value: 'all', label: 'Todos los nichos' },
                        ...CLIENT_NICHES.map(n => ({ value: n, label: n })),
                      ]}
                    />
                    <Select
                      value={sortBy + ':' + sortDir}
                      onChange={e => {
                        const parts = e.target.value.split(':')
                        setSortBy(parts[0])
                        setSortDir(parts[1])
                      }}
                      size="sm"
                      options={[
                        { value: 'updated_at:desc',     label: 'Mas recientes' },
                        { value: 'created_at:desc',     label: 'Fecha creacion' },
                        { value: 'name:asc',            label: 'Nombre A-Z' },
                        { value: 'monthly_value:desc',  label: 'Mayor valor' },
                        { value: 'last_contact_at:asc', label: 'Sin contactar' },
                      ]}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loading ? (
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <EmptyState icon={AlertTriangle} title="Error al cargar" description={error} size="sm" />
            ) : clients.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                emoji="ðŸ‘¥"
                title="Sin clientes"
                description={search ? 'Ningun cliente coincide.' : 'Crea tu primer cliente para empezar.'}
                size="sm"
                actionShortcut="Cmd+N"
                action={!search && (
                  <Button size="sm" onClick={openCreate} icon={<UserPlus className="w-3.5 h-3.5" />}>
                    Crear cliente
                  </Button>
                )}
              />
            ) : (
              clients.map(c => (
                <ClientCard
                  key={c.id}
                  client={c}
                  isSelected={selectedId === c.id}
                  onClick={() => {
                    setSelectedId(c.id)
                    addRecent('client', c.id)
                    setCurrentItem({ type: 'client', id: c.id, name: c.name })
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* PANEL DERECHO â€” en mÃ³vil solo se muestra cuando hay un cliente seleccionado */}
        <div className={clsx(
          'flex-1 flex-col overflow-hidden bg-surface-0',
          selectedId ? 'flex' : 'hidden md:flex'
        )}>
          <ClientDetail
            client={detail}
            timeline={timeline}
            projects={relProjects}
            finance={finance}
            loading={detailLoading}
            onEdit={openEdit}
            onArchive={handleArchive}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onBack={() => setSelectedId(null)}
          />
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        description={editing ? 'Modifica los datos del cliente' : 'AÃ±ade un nuevo cliente a tu CRM'}
        size="lg"
      >
        <ClientForm
          initial={editing}
          onSave={handleSave}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>

      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={clsx(
              'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-modal flex items-center gap-2',
              toastMsg.type === 'error'
                ? 'bg-status-danger/90 text-white border border-status-danger'
                : 'bg-status-success/90 text-white border border-status-success'
            )}
          >
            {toastMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



