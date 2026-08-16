import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/shared/lib/supabase'
import {
  LogOut, FolderKanban, MessageSquare,
  FileText, Check, Clock, Send,
  Download, Receipt, Eye, LayoutDashboard, CheckCircle2,
} from 'lucide-react'

const STATUS_CFG = {
  pending:   { label: 'Pendiente',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  active:    { label: 'En curso',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  review:    { label: 'Revision',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: 'Completado', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelled: { label: 'Cancelado',  color: '#e63946', bg: 'rgba(230,57,70,0.1)' },
}

// Etapas de un proyecto, en orden, para el "stepper" de progreso del cliente.
const STAGE_STEPS = [
  { key: 'preproduction',  label: 'Preproducción' },
  { key: 'production',     label: 'Producción' },
  { key: 'postproduction', label: 'Postproducción' },
  { key: 'delivery',       label: 'Entrega' },
]
function stageIndex(project) {
  if (project.status === 'completed' || project.stage === 'closed') return STAGE_STEPS.length
  const i = STAGE_STEPS.findIndex((s) => s.key === project.stage)
  return i === -1 ? 0 : i
}

// Anillo de progreso (SVG, fondo transparente) para el "Resumen".
function ProgressRing({ value, size = 116, stroke = 10 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={stroke} opacity="0.5" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

// Stepper horizontal de etapas de un proyecto.
function StageStepper({ project }) {
  const current = stageIndex(project)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '14px' }}>
      {STAGE_STEPS.map((s, i) => {
        const done = i < current
        const active = i === current
        const on = done || active
        return (
          <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i > 0 && (
              <div style={{ position: 'absolute', top: '11px', left: '-50%', width: '100%', height: '2px', background: done || active ? 'var(--brand)' : 'var(--bg-4)', zIndex: 0 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--brand)' : active ? 'var(--brand-dim)' : 'var(--bg-3)',
              border: '2px solid ' + (on ? 'var(--brand)' : 'var(--border)'), color: done ? '#fff' : active ? 'var(--brand)' : 'var(--text-5)' }}>
              {done ? <Check style={{ width: '13px', height: '13px' }} /> : <span style={{ fontSize: '11px', fontWeight: 800 }}>{i + 1}</span>}
            </div>
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: on ? 'var(--text-2)' : 'var(--text-5)', marginTop: '6px', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div style={{ flex: 1, minWidth: '128px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
      <p style={{ fontSize: '22px', fontWeight: 800, color: accent || 'var(--text-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginTop: '8px' }}>{label}</p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>{sub}</p>}
    </div>
  )
}
const APPROVAL_CFG = {
  pending:  { label: 'Pendiente', color: '#f59e0b' },
  approved: { label: 'Aprobado',  color: '#22c55e' },
  rejected: { label: 'Rechazado', color: '#e63946' },
  revision: { label: 'Revision',  color: '#3b82f6' },
}

function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
function fmtSize(b) {
  if (!b) return '0 B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}
function fileIcon(type) {
  if (!type) return 'ðŸ“Ž'
  if (type.startsWith('image/'))  return 'ðŸ–¼'
  if (type === 'application/pdf') return 'ðŸ“„'
  if (type.includes('word'))      return 'ðŸ“'
  if (type.startsWith('video/'))  return 'ðŸŽ¬'
  return 'ðŸ“Ž'
}
function darken(hex, amount) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const num = parseInt(h, 16)
  const r = Math.max(0, ((num >> 16) & 255) - amount)
  const g = Math.max(0, ((num >> 8) & 255) - amount)
  const b = Math.max(0, (num & 255) - amount)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

/**
 * Vista del portal tal como la ve el cliente.
 *
 * @param data      { client, projects, files, approvals, invoices, messages, portalUser?, ownerId? }
 * @param branding  { company_name, logo_url, brand_color }
 * @param user      usuario auth (solo en modo 'client')
 * @param mode      'client' (portal real, interactivo) | 'preview' (owner, solo lectura)
 * @param onExit    acción del botón de la esquina (cerrar sesión o cerrar la vista previa)
 */
export default function PortalView({ data, branding = {}, user = null, mode = 'client', onExit }) {
  const isPreview = mode === 'preview'
  const [tab, setTab]         = useState('overview')
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending]   = useState(false)
  const [messages, setMessages] = useState(data?.messages || [])
  const [approvals, setApprovals] = useState(data?.approvals || [])
  const [paying, setPaying]     = useState(null)
  const endRef = useRef(null)

  // Sincroniza el estado local si cambian los datos de entrada.
  useEffect(() => { setMessages(data?.messages || []) }, [data])
  useEffect(() => { setApprovals(data?.approvals || []) }, [data])

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handlePay(inv) {
    if (isPreview) return
    setPaying(inv.id)
    try {
      const res = await supabase.functions
        .invoke('create-checkout', { body: { invoice_id: inv.id, return_path: '/portal/dashboard' } })
      if (res.error) throw res.error
      const url = res.data && res.data.url
      if (!url) throw new Error((res.data && res.data.error) || 'No se pudo iniciar el pago')
      window.location.href = url
    } catch (e) {
      window.alert('No se pudo iniciar el pago: ' + (e.message || e))
    } finally {
      setPaying(null)
    }
  }

  async function handleSendMessage() {
    const text = msgInput.trim()
    if (isPreview || !text || sending || !data) return
    setSending(true)
    try {
      const res = await supabase.from('portal_messages').insert({
        client_id:      data.client.id,
        owner_id:       data.ownerId,
        portal_user_id: data.portalUser?.id,
        sender_type:    'client',
        content:        text,
        read:           false,
      }).select().single()
      if (res.error) throw res.error
      setMessages((prev) => prev.concat([res.data]))
      setMsgInput('')
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  async function handleApprovalAction(approvalId, status, feedback) {
    if (isPreview) return
    try {
      const res = await supabase.from('portal_approvals')
        .update({ status, feedback: feedback || null, updated_at: new Date().toISOString() })
        .eq('id', approvalId)
        .select().single()
      if (res.error) throw res.error
      setApprovals((prev) => prev.map((a) => (a.id === approvalId ? { ...a, status, feedback } : a)))
    } catch (e) {
      console.error(e)
    }
  }

  const brandColor = branding.brand_color || '#e63946'
  const brandVars = {
    '--brand': brandColor,
    '--gradient-brand': 'linear-gradient(135deg, ' + brandColor + ', ' + darken(brandColor, 30) + ')',
  }

  const client   = data && data.client
  const projects = (data && data.projects) || []
  const files    = (data && data.files)    || []
  const invoices = (data && data.invoices) || []

  // Métricas para el "Resumen".
  const activeProjects = projects.filter((p) => p.status !== 'completed' && p.status !== 'cancelled')
  const globalProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / projects.length)
    : 0
  const pendingInvoices = invoices.filter((i) => i.status === 'sent')
  const pendingInvoiceTotal = pendingInvoices.reduce((s, i) => s + (Number(i.total) || 0), 0)
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length
  const nextDue = activeProjects
    .filter((p) => p.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

  const TABS = [
    { id: 'overview',  label: 'Resumen',      icon: LayoutDashboard, count: 0 },
    { id: 'projects',  label: 'Proyectos',    icon: FolderKanban, count: projects.length },
    { id: 'invoices',  label: 'Facturas',     icon: Receipt,      count: invoices.filter((i) => i.status === 'sent').length },
    { id: 'messages',  label: 'Mensajes',     icon: MessageSquare, count: messages.filter((m) => m.sender_type === 'owner' && !m.read).length },
    { id: 'files',     label: 'Archivos',     icon: FileText,     count: files.length },
    { id: 'approvals', label: 'Aprobaciones', icon: Check,        count: approvals.filter((a) => a.status === 'pending').length },
  ]

  const greetName = (data && data.portalUser && data.portalUser.name)
    || (client && client.name)
    || (user && user.email)
    || ''

  return (
    <div style={{ ...brandVars, minHeight: isPreview ? '100%' : '100vh', height: isPreview ? '100%' : undefined, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Banner de vista previa (solo modo preview) */}
      {isPreview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(59,130,246,0.12)', borderBottom: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
          <Eye style={{ width: '14px', height: '14px' }} />
          Vista previa –” así ve tu cliente su portal (solo lectura)
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {branding.logo_url ? (
            <img src={branding.logo_url} alt={branding.company_name || 'Logo'} style={{ height: '28px', maxWidth: '90px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#fff' }}>
              {branding.company_name ? branding.company_name[0].toUpperCase() : 'A'}
            </div>
          )}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>{client && client.name}</p>
            {client && client.company && <p style={{ fontSize: '10px', color: 'var(--text-4)', marginTop: '1px' }}>{client.company}</p>}
          </div>
        </div>
        {onExit && (
          <button type="button" onClick={onExit}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: '12px', fontWeight: 600 }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            {isPreview ? 'Cerrar' : 'Salir'}
          </button>
        )}
      </div>

      {/* Bienvenida + tabs */}
      <div style={{ padding: '20px 20px 0', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-1)', marginBottom: '14px', letterSpacing: '-0.02em' }}>
          Hola, {greetName} ðŸ‘‹
        </p>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {TABS.map((t) => {
            const Icon   = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', borderRadius: 0, border: 'none',
                  borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                  background: 'transparent',
                  color: active ? 'var(--brand)' : 'var(--text-4)',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s',
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                {t.label}
                {t.count > 0 && (
                  <span style={{ padding: '1px 6px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: active ? 'rgba(230,57,70,0.15)' : 'var(--bg-4)', color: active ? 'var(--brand)' : 'var(--text-4)' }}>{t.count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {tab === 'overview' && (
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hero con anillo de progreso global */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '18px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '116px', height: '116px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProgressRing value={globalProgress} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{globalProgress}%</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-4)', marginTop: '2px' }}>global</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Hola, {greetName} ðŸ‘‹</p>
                <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: '4px', lineHeight: 1.5 }}>
                  {activeProjects.length > 0
                    ? 'Tienes ' + activeProjects.length + (activeProjects.length === 1 ? ' proyecto en curso' : ' proyectos en curso') + '.'
                    : 'No tienes proyectos activos ahora mismo.'}
                  {nextDue && ' Próxima entrega el ' + fmtDate(nextDue.due_date) + '.'}
                </p>
              </div>
            </motion.div>

            {/* Tiles de métricas */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <StatTile label="Proyectos activos" value={activeProjects.length} />
              <StatTile label="Facturas pendientes" value={pendingInvoices.length}
                sub={pendingInvoiceTotal > 0 ? pendingInvoiceTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 }) + '–‚¬ por cobrar' : 'Todo al día'}
                accent={pendingInvoices.length > 0 ? 'var(--brand)' : undefined} />
              <StatTile label="Aprobaciones" value={pendingApprovals} sub={pendingApprovals > 0 ? 'esperan tu revisión' : 'nada pendiente'}
                accent={pendingApprovals > 0 ? '#f59e0b' : undefined} />
            </div>

            {/* Progreso por proyecto */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 2px 10px' }}>Progreso de tus proyectos</p>
              {activeProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-4)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                  <CheckCircle2 style={{ width: '30px', height: '30px', margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px' }}>Sin proyectos en curso.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeProjects.map((p) => {
                    const sc = STATUS_CFG[p.status] || STATUS_CFG.pending
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{p.name}</p>
                            {p.due_date && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                                <Clock style={{ width: '11px', height: '11px', color: 'var(--text-5)' }} />
                                <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>Entrega: {fmtDate(p.due_date)}</span>
                              </div>
                            )}
                          </div>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-4)' }}>Progreso</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)' }}>{p.progress || 0}%</span>
                          </div>
                          <div style={{ height: '5px', background: 'var(--bg-4)', borderRadius: '3px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: (p.progress || 0) + '%' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              style={{ height: '100%', background: 'var(--gradient-brand)', borderRadius: '3px' }} />
                          </div>
                        </div>
                        <StageStepper project={p} />
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)' }}>
                <FolderKanban style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>No hay proyectos activos</p>
              </div>
            ) : (
              projects.map((p) => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG.pending
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{p.name}</p>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                    </div>
                    {p.description && <p style={{ fontSize: '13px', color: 'var(--text-4)', marginBottom: '12px', lineHeight: 1.5 }}>{p.description}</p>}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-4)' }}>Progreso</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)' }}>{p.progress || 0}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: (p.progress || 0) + '%', background: 'var(--gradient-brand)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    {p.due_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                        <Clock style={{ width: '12px', height: '12px', color: 'var(--text-5)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>Entrega: {fmtDate(p.due_date)}</span>
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        )}

        {tab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)' }}>
                <Receipt style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px' }}>No tienes facturas todavía</p>
              </div>
            ) : (
              invoices.map((inv) => {
                const paid = inv.status === 'paid'
                return (
                  <div key={inv.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{inv.invoice_number}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>
                        {inv.due_date ? 'Vence: ' + new Date(inv.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                        {(Number(inv.total) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}–‚¬
                      </p>
                      {paid ? (
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Pagada</span>
                      ) : (
                        <button type="button" onClick={() => handlePay(inv)} disabled={isPreview || paying === inv.id}
                          title={isPreview ? 'Disponible para el cliente en el portal real' : undefined}
                          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--gradient-brand)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: (isPreview || paying === inv.id) ? 'not-allowed' : 'pointer', opacity: (isPreview || paying === inv.id) ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                          {paying === inv.id ? 'Abriendo│' : 'Pagar'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)' }}>
                  <MessageSquare style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px' }}>Sin mensajes aun</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isClient = msg.sender_type === 'client'
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px',
                        borderRadius: isClient ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isClient ? 'var(--gradient-brand)' : 'var(--bg-3)',
                        border: isClient ? 'none' : '1px solid var(--border)',
                        color: isClient ? '#fff' : 'var(--text-1)',
                        fontSize: '14px', lineHeight: 1.6,
                      }}>
                        {!isClient && <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand)', marginBottom: '4px' }}>Tu proveedor</p>}
                        <p>{msg.content}</p>
                        <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: isClient ? 'right' : 'left' }}>
                          {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={endRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <input
                value={msgInput}
                disabled={isPreview}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                placeholder={isPreview ? 'Vista previa –” el cliente escribe aquí' : 'Escribe un mensaje...'}
                style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', opacity: isPreview ? 0.6 : 1 }}
              />
              <button type="button" onClick={handleSendMessage} disabled={isPreview || !msgInput.trim() || sending}
                style={{ width: '40px', height: '40px', borderRadius: '10px', background: (!isPreview && msgInput.trim() && !sending) ? 'var(--gradient-brand)' : 'var(--bg-4)', border: 'none', color: (!isPreview && msgInput.trim() && !sending) ? '#fff' : 'var(--text-5)', cursor: (!isPreview && msgInput.trim() && !sending) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}

        {tab === 'files' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)' }}>
                <FileText style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>Sin archivos compartidos</p>
              </div>
            ) : (
              files.map((f) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px' }}
                >
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{fileIcon(f.file_type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{fmtSize(f.file_size)} · {fmtDate(f.created_at)}</p>
                    {f.description && <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>{f.description}</p>}
                  </div>
                  <a href={f.file_url} target="_blank" rel="noreferrer" download
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-2)', textDecoration: 'none', flexShrink: 0 }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                  </a>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-4)' }}>
                <Check style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>Sin solicitudes de aprobacion</p>
              </div>
            ) : (
              approvals.map((a) => {
                const ac = APPROVAL_CFG[a.status] || APPROVAL_CFG.pending
                const isPending = a.status === 'pending'
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{a.title}</p>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: ac.color + '20', color: ac.color, flexShrink: 0 }}>{ac.label}</span>
                    </div>
                    {a.description && <p style={{ fontSize: '13px', color: 'var(--text-4)', marginBottom: '12px', lineHeight: 1.5 }}>{a.description}</p>}
                    {a.due_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                        <Clock style={{ width: '12px', height: '12px', color: 'var(--text-5)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>Fecha limite: {fmtDate(a.due_date)}</span>
                      </div>
                    )}
                    {a.feedback && (
                      <div style={{ padding: '10px 12px', background: 'var(--bg-3)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-3)', marginBottom: '12px', lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-2)' }}>Tu feedback: </span>{a.feedback}
                      </div>
                    )}
                    {isPending && !isPreview && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button"
                          onClick={() => handleApprovalAction(a.id, 'revision', window.prompt('Escribe tu feedback o comentarios:') || '')}
                          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >Solicitar revision</button>
                        <button type="button"
                          onClick={() => handleApprovalAction(a.id, 'rejected', window.prompt('Motivo del rechazo:') || '')}
                          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: 'var(--brand)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >Rechazar</button>
                        <button type="button"
                          onClick={() => handleApprovalAction(a.id, 'approved', '')}
                          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        >–œ“ Aprobar</button>
                      </div>
                    )}
                    {isPending && isPreview && (
                      <p style={{ fontSize: '11px', color: 'var(--text-5)', fontStyle: 'italic' }}>El cliente verá aquí los botones Aprobar / Rechazar / Revisión.</p>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

