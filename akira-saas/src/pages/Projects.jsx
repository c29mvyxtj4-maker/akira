import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, FolderPlus, Archive,
  Edit3, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2,
  Calendar, DollarSign, TrendingUp, Flag,
} from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { PROJECT_STATUS_MAP, PROJECT_STAGE_MAP, PROJECT_PRIORITY_MAP } from '@/services/projects.service'
import { getProjectTemplates } from '@/services/templates.service'
import {
  getProjectTimeEntries, getRunningEntry, startTimer, stopTimer,
  addManualEntry, deleteTimeEntry, fmtDuration, sumSeconds,
} from '@/services/time.service'
import { supabase } from '@/lib/supabase'
import KanbanBoard from '@/components/projects/KanbanBoard'
import AskAkiraButton from '@/components/akira/AskAkiraButton'
import PageHeader      from '@/components/layout/PageHeader'
import Modal           from '@/components/ui/Modal'
import Badge           from '@/components/ui/Badge'
import Button          from '@/components/ui/Button'
import EmptyState      from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { SkeletonCard } from '@/components/ui/Skeleton'
import clsx            from 'clsx'
import ProjectSummaryCard from '@/components/projects/ProjectSummaryCard'
import ProjectFilesTab from '@/components/projects/ProjectFilesTab'

function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES') + '€' }
function daysLeft(d) { if (!d) return null; return Math.ceil((new Date(d) - Date.now()) / 86400000) }

var PRIO_COLOR = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' }
var PRIO_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' }

function ProjectKpis({ projects }) {
  var active = projects.filter(function(p) { return p.status === 'active' }).length
  var pending = projects.filter(function(p) { return p.status === 'pending' }).length
  var completed = projects.filter(function(p) { return p.status === 'completed' }).length
  var total = 0; var done = 0
  projects.forEach(function(p) {
    var t = Array.isArray(p.tasks) ? p.tasks : []
    total += t.length
    done  += t.filter(function(x) { return x.done }).length
  })
  return (
    <div className="grid grid-cols-2 gap-2 p-3 border-b border-border">
      {[
        { l: 'Activos',     v: active,           c: '#3b82f6' },
        { l: 'Pendientes',  v: pending,           c: '#f59e0b' },
        { l: 'Completados', v: completed,         c: '#22c55e' },
        { l: 'Tareas',      v: done + '/' + total, c: '#e63946' },
      ].map(function(x, i) {
        return (
          <motion.div key={x.l} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-2.5">
            <p className="text-sm font-black leading-none" style={{ color: x.c }}>{x.v}</p>
            <p className="text-2xs text-text-4 mt-0.5">{x.l}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

function StageBar({ stage }) {
  var STAGES = ['preproduction', 'production', 'postproduction', 'delivery', 'closed']
  var idx = STAGES.indexOf(stage)
  return (
    <div className="flex gap-0.5 mt-1.5">
      {STAGES.map(function(s, i) {
        var c = PROJECT_STAGE_MAP[s]
        return (
          <div key={s} className="h-0.5 flex-1 rounded-full"
            style={{ background: c ? c.color : '#374151', opacity: i <= idx ? 1 : 0.2 }}
          />
        )
      })}
    </div>
  )
}

function ProjectCard({ project, isSelected, onClick }) {
  var sc    = PROJECT_STATUS_MAP[project.status]
  var tasks = Array.isArray(project.tasks) ? project.tasks : []
  var done  = tasks.filter(function(t) { return t.done }).length
  var days  = daysLeft(project.due_date)
  var over  = days !== null && days < 0 && project.status !== 'completed' && project.status !== 'cancelled'
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={clsx(
        'w-full text-left px-3 py-3 rounded-lg border transition-all duration-150',
        isSelected ? 'bg-brand-500/10 border-brand-500/30' : 'bg-transparent border-transparent hover:bg-surface-3 hover:border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-text-1 truncate flex-1">{project.name}</span>
        {sc && <Badge color={sc.color} size="xs">{sc.label}</Badge>}
      </div>
      <p className="text-xs text-text-4 truncate mb-1">{project.clients ? project.clients.name : 'Sin cliente'}</p>
      <StageBar stage={project.stage} />
      <div className="flex items-center justify-between mt-1.5">
        {project.due_date && (
          <span className={clsx('text-2xs', over ? 'text-status-danger font-semibold' : 'text-text-4')}>
            {over ? 'Vencido ' : ''}{fmtDate(project.due_date)}
          </span>
        )}
        {tasks.length > 0 && <span className="text-2xs text-text-4 ml-auto">{done}/{tasks.length}</span>}
      </div>
    </motion.button>
  )
}

function TaskPanel({ project, onAddTask, onToggle, onDelete, onPriorityChange }) {
  var [showPrio, setShowPrio] = useState(null)
  var inputRef = useRef(null)
  var prioRef  = useRef('medium')

  var tasks   = project && Array.isArray(project.tasks) ? project.tasks : []
  var pending = tasks.filter(function(t) { return !t.done })
  var done    = tasks.filter(function(t) { return t.done })

  function doAdd() {
    var text = inputRef.current ? inputRef.current.value.trim() : ''
    var prio = prioRef.current || 'medium'
    if (!text || !project || !project.id) return
    onAddTask(project.id, text, prio)
    if (inputRef.current) inputRef.current.value = ''
    if (inputRef.current) inputRef.current.focus()
  }

  function renderTask(t) {
    return (
      <div key={t.id} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px', marginBottom: '4px',
        border: '1px solid rgba(255,255,255,0.06)',
        opacity: t.done ? 0.5 : 1,
      }}>
        <button type="button"
          onClick={function() { onToggle(project.id, t.id) }}
          style={{
            width: '18px', height: '18px', borderRadius: '50%',
            border: '2px solid ' + (t.done ? '#22c55e' : (PRIO_COLOR[t.priority] || '#6b7280')),
            background: t.done ? '#22c55e' : 'transparent',
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {t.done && <span style={{ color: '#000', fontSize: '10px', fontWeight: 900 }}>✓</span>}
        </button>

        <span style={{
          flex: 1, fontSize: '13px', color: '#e2e8f0',
          textDecoration: t.done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{t.text}</span>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button type="button"
            onClick={function() { setShowPrio(showPrio === t.id ? null : t.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
          >
            <Flag style={{ width: '12px', height: '12px', color: PRIO_COLOR[t.priority] || '#6b7280' }} />
          </button>
          {showPrio === t.id && (
            <div style={{
              position: 'absolute', right: 0, top: '24px', zIndex: 100,
              background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '4px', minWidth: '110px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {Object.entries(PRIO_LABEL).map(function(entry) {
                return (
                  <button key={entry[0]} type="button"
                    onClick={function() { onPriorityChange(project.id, t.id, entry[0]); setShowPrio(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '6px 10px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '12px' }}
                  >
                    <Flag style={{ width: '11px', height: '11px', color: PRIO_COLOR[entry[0]] }} />
                    {entry[1]}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button type="button"
          onClick={function() { onDelete(project.id, t.id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '18px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
        >x</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribe una tarea..."
          onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); doAdd() } }}
          style={{
            flex: '1 1 160px', padding: '9px 14px',
            background: '#1a1a2e',
            border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <select
          onChange={function(e) { prioRef.current = e.target.value }}
          defaultValue="medium"
          style={{ padding: '9px 8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <button
          type="button"
          onClick={doAdd}
          style={{ padding: '9px 20px', background: '#e63946', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Anadir
        </button>
      </div>

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          <CheckCircle2 style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: '13px' }}>Sin tareas todavia</p>
          <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>Escribe arriba y pulsa Enter o Anadir</p>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
            Pendientes ({pending.length})
          </p>
          {pending.map(renderTask)}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
            Completadas ({done.length})
          </p>
          {done.map(renderTask)}
        </div>
      )}
    </div>
  )
}

function TimePanel({ project }) {
  var [entries, setEntries] = useState([])
  var [running, setRunning] = useState(null)
  var [loading, setLoading] = useState(true)
  var [elapsed, setElapsed] = useState(0)
  var [showManual, setShowManual] = useState(false)
  var [manualHours, setManualHours] = useState('')
  var [manualDesc,  setManualDesc]  = useState('')
  var [manualDate,  setManualDate]  = useState(new Date().toISOString().split('T')[0])
  var [descInput, setDescInput] = useState('')
  var [busy, setBusy] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([getProjectTimeEntries(project.id), getRunningEntry()])
      .then(function(results) { setEntries(results[0]); setRunning(results[1]) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [project.id])

  useEffect(function() {
    var channel = supabase.channel('time-entries-' + project.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, function() { load() })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [project.id])

  var isRunningHere = running && running.project_id === project.id
  var isRunningElsewhere = running && running.project_id !== project.id

  useEffect(function() {
    if (!isRunningHere) { setElapsed(0); return }
    function tick() {
      setElapsed(Math.floor((Date.now() - new Date(running.started_at).getTime()) / 1000))
    }
    tick()
    var iv = setInterval(tick, 1000)
    return function() { clearInterval(iv) }
  }, [isRunningHere, running])

  function handleStart() {
    setBusy(true)
    startTimer(project.id, descInput.trim() || null)
      .then(function() { setDescInput(''); load() })
      .finally(function() { setBusy(false) })
  }

  function handleStop() {
    setBusy(true)
    stopTimer(running.id).then(load).finally(function() { setBusy(false) })
  }

  function handleAddManual() {
    if (!manualHours || Number(manualHours) <= 0) return
    setBusy(true)
    addManualEntry(project.id, { hours: manualHours, description: manualDesc, date: manualDate })
      .then(function() { setManualHours(''); setManualDesc(''); setShowManual(false); load() })
      .catch(function(e) { window.alert(e.message) })
      .finally(function() { setBusy(false) })
  }

  function handleDelete(id) {
    if (!window.confirm('Eliminar esta entrada de tiempo?')) return
    deleteTimeEntry(id).then(load)
  }

  function fmtElapsed(sec) {
    var h = Math.floor(sec / 3600)
    var m = Math.floor((sec % 3600) / 60)
    var s = sec % 60
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0')
  }

  var totalSeconds = sumSeconds(entries)
  var estimatedH   = Number(project.estimated_hours) || 0

  if (loading) return <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>

  return (
    <div>
      <div style={{ padding: '18px', background: isRunningHere ? 'rgba(230,57,70,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (isRunningHere ? 'rgba(230,57,70,0.25)' : 'rgba(255,255,255,0.06)'), borderRadius: '10px', marginBottom: '16px' }}>
        {isRunningHere ? (
          <div>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#e63946', fontFamily: 'monospace', textAlign: 'center' }}>{fmtElapsed(elapsed)}</p>
            {running.description && <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '10px' }}>{running.description}</p>}
            <button type="button" onClick={handleStop} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', borderRadius: '8px', background: '#e63946', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Detener</button>
          </div>
        ) : isRunningElsewhere ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
              Tienes un cronometro activo en <strong style={{ color: '#f1f5f9' }}>{running.projects ? running.projects.name : 'otro proyecto'}</strong>
            </p>
            <button type="button" onClick={function() { stopTimer(running.id).then(load) }}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >Detenerlo y empezar aqui</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={descInput} onChange={function(e) { setDescInput(e.target.value) }} placeholder="En que estas trabajando (opcional)"
              style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
            />
            <button type="button" onClick={handleStart} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >Iniciar</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="surface-card p-3">
          <p className="text-2xs text-text-4 mb-1">Tiempo registrado</p>
          <p className="text-lg font-black text-text-1">{fmtDuration(totalSeconds)}</p>
        </div>
        <div className="surface-card p-3">
          <p className="text-2xs text-text-4 mb-1">Horas estimadas</p>
          <p className="text-lg font-black text-text-1">{estimatedH > 0 ? estimatedH + 'h' : '--'}</p>
        </div>
      </div>

      {showManual ? (
        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="date" value={manualDate} onChange={function(e) { setManualDate(e.target.value) }}
              style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
            />
            <input type="number" min="0.25" step="0.25" value={manualHours} onChange={function(e) { setManualHours(e.target.value) }} placeholder="Horas"
              style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
            />
          </div>
          <input value={manualDesc} onChange={function(e) { setManualDesc(e.target.value) }} placeholder="Descripcion (opcional)"
            style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={function() { setShowManual(false) }} style={{ flex: 1, padding: '8px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button type="button" onClick={handleAddManual} disabled={busy || !manualHours} style={{ flex: 2, padding: '8px', borderRadius: '7px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Anadir</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={function() { setShowManual(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
        >Añadir tiempo manual</button>
      )}

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '13px' }}>Sin tiempo registrado todavia</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entries.filter(function(e) { return !e.is_running }).map(function(e) {
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#e2e8f0' }}>{e.description || 'Sin descripcion'}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{fmtDate(e.started_at)}</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', flexShrink: 0 }}>{fmtDuration(e.duration_seconds != null ? e.duration_seconds : (e.duration_minutes || 0) * 60)}</span>
                <button type="button" onClick={function() { handleDelete(e.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', flexShrink: 0 }}
                >x</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProgressBar({ progress, onUpdate, projectId }) {
  var pct = progress || 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-3">Progreso</span>
        <span className="text-xs font-bold text-text-1">{pct}%</span>
      </div>
      <div className="relative h-2 bg-surface-4 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: pct + '%' }} />
      </div>
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map(function(s) {
          return (
            <button key={s} type="button"
              onClick={function() { onUpdate(projectId, s) }}
              className={clsx('text-2xs transition-colors', pct >= s ? 'text-brand-400' : 'text-text-4 hover:text-text-3')}
            >{s}%</button>
          )
        })}
      </div>
    </div>
  )
}

function ProjectDetail({ project, loading, onEdit, onArchive, onAddTask, onToggleTask, onDeleteTask, onUpdateTaskPriority, onUpdateProgress, onBack }) {
  var [tab, setTab] = useState('overview')

  if (loading) return <div className="flex-1 flex items-center justify-center"><PageSpinner label="Cargando..." /></div>
  if (!project) return <EmptyState icon={FolderPlus} title="Selecciona un proyecto" description="Haz clic en un proyecto de la lista." className="flex-1 h-full" />

  var sc    = PROJECT_STATUS_MAP[project.status]
  var sgc   = PROJECT_STAGE_MAP[project.stage]
  var pc    = PROJECT_PRIORITY_MAP[project.priority]
  var tasks = Array.isArray(project.tasks) ? project.tasks : []
  var doneT = tasks.filter(function(t) { return t.done }).length
  var budget = Number(project.budget) || 0
  var cost   = Number(project.actual_cost) || 0
  var margin = budget > 0 ? Math.round(((budget - cost) / budget) * 100) : null
  var days   = daysLeft(project.due_date)
  var over   = days !== null && days < 0 && project.status !== 'completed' && project.status !== 'cancelled'

  // Contexto para Akira — se calcula aqui, DENTRO de ProjectDetail, donde "project" si existe ← CORREGIDO
  var akiraContext = [
    'Proyecto: ' + project.name,
    'Cliente: ' + (project.clients ? project.clients.name : 'Sin cliente'),
    'Estado: ' + (sc ? sc.label : project.status),
    'Etapa: ' + (sgc ? sgc.label : project.stage),
    'Progreso: ' + (project.progress || 0) + '%',
    budget > 0 ? 'Presupuesto: ' + budget + '€, coste real: ' + cost + '€' : null,
    tasks.length > 0 ? 'Tareas: ' + doneT + ' completadas de ' + tasks.length : null,
    project.due_date ? 'Entrega prevista: ' + project.due_date : null,
    project.description ? 'Descripcion: ' + project.description : null,
  ].filter(Boolean).join('\n')

  var TABS = [
    { id: 'overview', label: 'Resumen' },
    { id: 'tasks',    label: 'Tareas (' + tasks.length + ')' },
    { id: 'files',    label: 'Archivos' },
    { id: 'time',     label: 'Tiempo' },
    { id: 'dates',    label: 'Fechas' },
    { id: 'economy',  label: 'Economia' },
  ]

  return (
    <div key={project.id} className="flex flex-col h-full overflow-hidden" style={{ position: 'relative' }}>

      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-5 border-b border-border bg-surface-1">

        <button
          type="button"
          onClick={onBack}
          className="md:hidden mb-4 flex items-center gap-1 text-xs text-text-3 hover:text-text-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a proyectos
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-text-1">{project.name}</h2>
              {sc && <Badge color={sc.color}>{sc.label}</Badge>}
              {pc && <Badge color={pc.color} size="xs">{pc.label}</Badge>}
            </div>
            <p className="text-sm text-text-3">
              {project.clients ? project.clients.name : 'Sin cliente'}
              {sgc && <span className="ml-2 text-xs font-medium" style={{ color: sgc.color }}>/ {sgc.label}</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
            <Button variant="secondary" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={function() { onEdit(project) }}>Editar</Button>
            <Button variant="danger"    size="sm" icon={<Archive className="w-3.5 h-3.5" />} onClick={function() { onArchive(project.id) }}>Archivar</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { Icon: CheckCircle2, label: doneT + '/' + tasks.length + ' tareas', color: 'text-brand-400' },
            { Icon: DollarSign,   label: fmtCur(budget) + ' presupuesto',        color: 'text-status-success' },
            { Icon: TrendingUp,   label: margin !== null ? margin + '% margen' : 'Sin margen', color: margin !== null && margin >= 0 ? 'text-status-success' : 'text-status-danger' },
            { Icon: Calendar,     label: over ? 'Vencido' : days === 0 ? 'Hoy' : days !== null ? 'en ' + days + 'd' : 'Sin fecha', color: over ? 'text-status-danger' : 'text-text-3' },
          ].map(function(x, i) {
            return (
              <div key={i} className="surface-card p-2 flex items-center gap-1.5">
                <x.Icon className={clsx('w-3.5 h-3.5 flex-shrink-0', x.color)} />
                <span className={clsx('text-xs truncate', x.color)}>{x.label}</span>
              </div>
            )
          })}
        </div>

        <ProgressBar progress={project.progress} onUpdate={onUpdateProgress} projectId={project.id} />

        <div className="flex gap-1 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(function(t) {
            return (
              <button key={t.id} type="button"
                onClick={function() { setTab(t.id) }}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex-shrink-0',
                  tab === t.id ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25' : 'text-text-3 hover:text-text-2 hover:bg-surface-3'
                )}
              >{t.label}</button>
            )
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-5">

        <ProjectSummaryCard project={project} />

        <div style={{ display: tab === 'overview' ? 'block' : 'none' }}>
          <div className="space-y-4">
            {project.description && (
              <div>
                <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Descripcion</h4>
                <div className="surface-card p-4"><p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">{project.description}</p></div>
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Informacion</h4>
              <div className="surface-card divide-y divide-border">
                {[
                  ['Cliente',   project.clients ? project.clients.name : '--'],
                  ['Estado',    sc  ? sc.label  : project.status],
                  ['Etapa',     sgc ? sgc.label : project.stage],
                  ['Prioridad', pc  ? pc.label  : project.priority],
                  ['Progreso',  (project.progress || 0) + '%'],
                  ['Horas',     project.estimated_hours > 0 ? project.estimated_hours + 'h' : '--'],
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
            {project.notes && (
              <div>
                <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Notas</h4>
                <div className="surface-card p-4"><p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">{project.notes}</p></div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: tab === 'tasks' ? 'block' : 'none' }}>
          <TaskPanel
            project={project}
            onAddTask={onAddTask}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onPriorityChange={onUpdateTaskPriority}
          />
        </div>

        <div style={{ display: tab === 'files' ? 'block' : 'none' }}>
          {tab === 'files' && <ProjectFilesTab project={project} />}
        </div>

        <div style={{ display: tab === 'time' ? 'block' : 'none' }}>
          {tab === 'time' && <TimePanel project={project} />}
        </div>

        <div style={{ display: tab === 'dates' ? 'block' : 'none' }}>
          <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Fechas clave</h4>
          <div className="surface-card divide-y divide-border">
            {[
              ['Inicio',           project.start_date],
              ['Rodaje',           project.shoot_date],
              ['Entrega prevista', project.due_date],
              ['Entrega real',     project.delivery_date],
            ].map(function(row) {
              var d  = daysLeft(row[1])
              var ov = d !== null && d < 0
              return (
                <div key={row[0]} className="flex justify-between items-center px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-text-4" />
                    <span className="text-xs text-text-3">{row[0]}</span>
                  </div>
                  <div className="text-right">
                    <span className={clsx('text-xs font-medium', ov ? 'text-status-danger' : 'text-text-1')}>{fmtDate(row[1])}</span>
                    {d !== null && project.status !== 'completed' && (
                      <p className={clsx('text-2xs mt-0.5', ov ? 'text-status-danger' : 'text-text-4')}>
                        {ov ? Math.abs(d) + 'd pasado' : d === 0 ? 'Hoy' : 'en ' + d + 'd'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: tab === 'economy' ? 'block' : 'none' }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { l: 'Presupuesto',    v: fmtCur(budget), c: 'text-text-1' },
              { l: 'Coste real',      v: fmtCur(cost),   c: 'text-status-danger' },
              { l: 'Margen estimado', v: margin !== null ? margin + '%' : '--', c: margin !== null && margin >= 0 ? 'text-status-success' : 'text-status-danger' },
              { l: 'Horas estimadas', v: project.estimated_hours > 0 ? project.estimated_hours + 'h' : '--', c: 'text-text-1' },
            ].map(function(x) {
              return (
                <div key={x.l} className="surface-card p-4">
                  <p className="text-2xs text-text-4 mb-1">{x.l}</p>
                  <p className={clsx('text-xl font-black', x.c)}>{x.v}</p>
                </div>
              )
            })}
          </div>
          {budget > 0 && (
            <div className="surface-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-text-3">Coste vs Presupuesto</span>
                <span className="text-xs font-semibold text-text-1">{Math.min(Math.round((cost / budget) * 100), 100)}%</span>
              </div>
              <div className="h-2 bg-surface-4 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', cost > budget ? 'bg-status-danger' : 'bg-status-success')}
                  style={{ width: Math.min((cost / budget) * 100, 100) + '%' }}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Boton contextual de Akira — NUEVO, colocado aqui, ya con "project" en su ambito correcto */}
      <AskAkiraButton contextLabel={project.name} contextText={akiraContext} />
    </div>
  )
}

function ProjectForm({ initial, clients, onSave, onCancel, loading }) {
  var EMPTY = {
    name: '', client_id: '', description: '',
    status: 'pending', priority: 'medium', stage: 'preproduction',
    budget: '', actual_cost: '', estimated_hours: '',
    start_date: '', due_date: '', shoot_date: '', delivery_date: '',
    notes: '',
  }
  var [form, setForm] = useState(function() {
    if (!initial) return EMPTY
    return {
      name:            initial.name            || '',
      client_id:       initial.client_id       || '',
      description:     initial.description     || '',
      status:          initial.status          || 'pending',
      priority:        initial.priority        || 'medium',
      stage:           initial.stage           || 'preproduction',
      budget:          initial.budget          != null ? String(initial.budget) : '',
      actual_cost:     initial.actual_cost     != null ? String(initial.actual_cost) : '',
      estimated_hours: initial.estimated_hours != null ? String(initial.estimated_hours) : '',
      start_date:      initial.start_date      || '',
      due_date:        initial.due_date        || '',
      shoot_date:      initial.shoot_date      || '',
      delivery_date:   initial.delivery_date   || '',
      notes:           initial.notes           || '',
    }
  })

  var [templates, setTemplates] = useState([])
  var [templateId, setTemplateId] = useState('')

  useEffect(function() {
    if (initial) return
    getProjectTemplates().then(setTemplates).catch(function() {})
  }, [initial])

  function applyTemplate(id) {
    setTemplateId(id)
    if (!id) return
    var t = templates.find(function(x) { return x.id === id })
    if (!t) return
    setForm(function(f) {
      return Object.assign({}, f, {
        priority: t.default_priority || f.priority,
        stage:    t.default_stage    || f.stage,
        budget:   t.default_budget   ? String(t.default_budget) : f.budget,
        notes:    t.default_notes    || f.notes,
      })
    })
  }

  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }
  function handleSubmit(e) { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }

  var opts = [{ value: '', label: 'Sin cliente' }].concat(
    clients.map(function(c) { return { value: c.id, label: c.name + (c.company ? ' - ' + c.company : '') } })
  )
  var I = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {!initial && templates.length > 0 && (
        <div>
          <label className="label-base">Empezar desde plantilla (opcional)</label>
          <select value={templateId} onChange={function(e) { applyTemplate(e.target.value) }} style={I}>
            <option value="">Sin plantilla</option>
            {templates.map(function(t) { return <option key={t.id} value={t.id}>{t.name}</option> })}
          </select>
        </div>
      )}

      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Identidad</p>
        <div className="space-y-3">
          <div><label className="label-base">Nombre *</label><input value={form.name} onChange={set('name')} placeholder="Campana verano 2025" style={I} /></div>
          <div><label className="label-base">Cliente</label>
            <select value={form.client_id} onChange={set('client_id')} style={I}>
              {opts.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
            </select>
          </div>
          <div><label className="label-base">Descripcion</label><textarea value={form.description} onChange={set('description')} rows={2} placeholder="Brief..." style={Object.assign({}, I, { resize: 'vertical' })} /></div>
        </div>
      </div>
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Estado</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="label-base">Estado</label>
            <select value={form.status} onChange={set('status')} style={I}>
              {Object.entries(PROJECT_STATUS_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
            </select>
          </div>
          <div><label className="label-base">Prioridad</label>
            <select value={form.priority} onChange={set('priority')} style={I}>
              {Object.entries(PROJECT_PRIORITY_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
            </select>
          </div>
          <div><label className="label-base">Etapa</label>
            <select value={form.stage} onChange={set('stage')} style={I}>
              {Object.entries(PROJECT_STAGE_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
            </select>
          </div>
        </div>
      </div>
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Fechas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="label-base">Inicio</label><input type="date" value={form.start_date} onChange={set('start_date')} style={I} /></div>
          <div><label className="label-base">Entrega prevista</label><input type="date" value={form.due_date} onChange={set('due_date')} style={I} /></div>
          <div><label className="label-base">Rodaje</label><input type="date" value={form.shoot_date} onChange={set('shoot_date')} style={I} /></div>
          <div><label className="label-base">Entrega real</label><input type="date" value={form.delivery_date} onChange={set('delivery_date')} style={I} /></div>
        </div>
      </div>
      <div>
        <p className="text-2xs text-text-4 uppercase tracking-wider mb-3 font-semibold">Economia</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="label-base">Presupuesto</label><input type="number" min="0" value={form.budget} onChange={set('budget')} placeholder="0" style={I} /></div>
          <div><label className="label-base">Coste real</label><input type="number" min="0" value={form.actual_cost} onChange={set('actual_cost')} placeholder="0" style={I} /></div>
          <div><label className="label-base">Horas est.</label><input type="number" min="0" value={form.estimated_hours} onChange={set('estimated_hours')} placeholder="0" style={I} /></div>
        </div>
      </div>
      <div><label className="label-base">Notas</label><textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Notas..." style={Object.assign({}, I, { resize: 'vertical' })} /></div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear proyecto'}</Button>
      </div>
    </form>
  )
}

export default function Projects() {
  var hook = useProjects()
  var [showFilters, setShowFilters] = useState(false)
  var [viewMode, setViewMode] = useState('list')
  var SI = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', padding: '6px 10px',
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', cursor: 'pointer',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Proyectos"
        description={hook.projects.length + ' proyecto' + (hook.projects.length !== 1 ? 's' : '')}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-3)', borderRadius: '8px', padding: '3px' }}>
              {[{ id: 'list', label: 'Lista' }, { id: 'kanban', label: 'Kanban' }].map(function(v) {
                var active = viewMode === v.id
                return (
                  <button key={v.id} type="button" onClick={function() { setViewMode(v.id) }}
                    style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? 'var(--gradient-brand)' : 'transparent', color: active ? '#fff' : 'var(--text-4)' }}
                  >{v.label}</button>
                )
              })}
            </div>
            <Button icon={<FolderPlus className="w-4 h-4" />} onClick={hook.openCreate}>Nuevo proyecto</Button>
          </div>
        }
      />

      {viewMode === 'kanban' ? (
        <div style={{ flex: 1, overflow: 'hidden', padding: '16px' }}>
          <KanbanBoard
            projects={hook.projects}
            onSelect={function(id) { hook.setSelectedId(id); setViewMode('list') }}
            onUpdateStage={hook.handleUpdateStage}
          />
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden">

        <div className={clsx(
          'w-full md:w-72 flex-shrink-0 flex-col border-r border-border bg-surface-1 overflow-hidden',
          hook.selectedId ? 'hidden md:flex' : 'flex'
        )}>
          <ProjectKpis projects={hook.projects} />

          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
              <input value={hook.search} onChange={function(e) { hook.setSearch(e.target.value) }} placeholder="Buscar proyecto..." className="input-base pl-8 w-full h-8 text-xs" />
            </div>

            <button type="button" onClick={function() { setShowFilters(function(v) { return !v }) }} className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors w-full">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
              <ChevronRight className={clsx('w-3 h-3 ml-auto transition-transform duration-200', showFilters && 'rotate-90')} />
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="space-y-2 pt-1">
                    <select value={hook.status}   onChange={function(e) { hook.setStatus(e.target.value) }}   style={SI}><option value="all">Todos los estados</option>{Object.entries(PROJECT_STATUS_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}</select>
                    <select value={hook.stage}    onChange={function(e) { hook.setStage(e.target.value) }}    style={SI}><option value="all">Todas las etapas</option>{Object.entries(PROJECT_STAGE_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}</select>
                    <select value={hook.priority} onChange={function(e) { hook.setPriority(e.target.value) }} style={SI}><option value="all">Todas las prioridades</option>{Object.entries(PROJECT_PRIORITY_MAP).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}</select>
                    <select value={hook.clientId} onChange={function(e) { hook.setClientId(e.target.value) }} style={SI}><option value="all">Todos los clientes</option>{hook.clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option> })}</select>
                    <select value={hook.sortBy + ':' + hook.sortDir} onChange={function(e) { var p = e.target.value.split(':'); hook.setSortBy(p[0]); hook.setSortDir(p[1]) }} style={SI}>
                      <option value="due_date:asc">Entrega proxima</option>
                      <option value="created_at:desc">Mas recientes</option>
                      <option value="name:asc">Nombre A-Z</option>
                      <option value="budget:desc">Mayor presupuesto</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {hook.loading ? (
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : hook.error ? (
              <EmptyState icon={AlertTriangle} title="Error" description={hook.error} size="sm" />
            ) : hook.projects.length === 0 ? (
              <EmptyState
                icon={FolderPlus}
                emoji="📁"
                title="Sin proyectos"
                description={hook.search ? 'Ningun proyecto coincide.' : 'Crea tu primer proyecto.'}
                size="sm"
                actionShortcut="Cmd+N"
                action={!hook.search && <Button size="sm" onClick={hook.openCreate} icon={<FolderPlus className="w-3.5 h-3.5" />}>Crear proyecto</Button>}
              />
            ) : (
              hook.projects.map(function(p) {
                return (
                  <ProjectCard key={p.id} project={p} isSelected={hook.selectedId === p.id} onClick={function() { hook.setSelectedId(p.id) }} />
                )
              })
            )}
          </div>
        </div>

        <div className={clsx(
          'flex-1 flex-col overflow-hidden bg-surface-0',
          hook.selectedId ? 'flex' : 'hidden md:flex'
        )}>
          <ProjectDetail
            project={hook.detail}
            loading={hook.detailLoading}
            onEdit={hook.openEdit}
            onArchive={hook.handleArchive}
            onAddTask={hook.handleAddTask}
            onToggleTask={hook.handleToggleTask}
            onDeleteTask={hook.handleDeleteTask}
            onUpdateTaskPriority={hook.handleUpdateTaskPriority}
            onUpdateProgress={hook.handleUpdateProgress}
            onBack={function() { hook.setSelectedId(null) }}
          />
        </div>
      </div>
      )}

      <Modal open={hook.modalOpen} onClose={hook.closeModal} title={hook.editing ? 'Editar proyecto' : 'Nuevo proyecto'} size="lg">
        <ProjectForm initial={hook.editing} clients={hook.clients} onSave={hook.handleSave} onCancel={hook.closeModal} loading={hook.formLoading} />
      </Modal>

      <AnimatePresence>
        {hook.toastMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: hook.toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}
          >{hook.toastMsg.msg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}