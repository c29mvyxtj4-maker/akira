import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, X,
  Clock, MapPin, Tag, Calendar as CalendarIcon,
  AlertCircle, CheckCircle, Circle, Edit3, ListTodo,
} from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { getPref } from '@/hooks/usePreferences'
import clsx from 'clsx'

// Respeta la preferencia "Comenzar la semana el lunes".
function weekStartsMonday() { return getPref('pref_week_monday', true) !== false }
var DAYS_MON = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM']
var DAYS_SUN = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']
function daysArr() { return weekStartsMonday() ? DAYS_MON : DAYS_SUN }
var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Categorías de evento (una sola fuente): etiqueta + color distintivo para
// poder categorizar los eventos por color en todas las vistas.
var CATEGORIES = {
  meeting:  { label: 'Reunión',      color: '#e63946' },
  call:     { label: 'Llamada',      color: '#3b82f6' },
  deadline: { label: 'Deadline',     color: '#f59e0b' },
  delivery: { label: 'Entrega',      color: '#22c55e' },
  personal: { label: 'Personal',     color: '#a855f7' },
  reminder: { label: 'Recordatorio', color: '#ec4899' },
  other:    { label: 'Otro',         color: '#64748b' },
}
function catStyle(color) {
  return { color: color, bg: color + '22', border: color + '55', text: color, dot: color }
}
// Estilos derivados por categoría; los tipos desconocidos caen en 'other'.
var EVENT_COLORS = Object.keys(CATEGORIES).reduce(function(acc, k) {
  acc[k] = catStyle(CATEGORIES[k].color)
  return acc
}, {})

var STATUS_CFG = {
  pending:   { icon: Circle,      color: 'rgba(255,255,255,0.4)', label: 'Pendiente' },
  completed: { icon: CheckCircle, color: '#e63946',               label: 'Completado' },
  cancelled: { icon: X,           color: 'rgba(255,255,255,0.25)', label: 'Cancelado' },
}

var WEEK_HOUR_START = 0      // vista de semana: todas las horas del día
var WEEK_HOUR_END   = 23
var ROW_HEIGHT       = 48
var WEEK_SCROLL_TO_HOUR = 7  // al abrir, desplaza hasta la mañana

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  var day = new Date(year, month, 1).getDay()
  return weekStartsMonday() ? (day === 0 ? 6 : day - 1) : day
}

function fmtTime(t) {
  if (!t) return ''
  return t.slice(0, 5)
}

function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function toDateStr(d) {
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

// Inicio de la semana (lunes o domingo según preferencia).
function getMonday(date) {
  var d = new Date(date)
  var day = d.getDay()
  var diff = weekStartsMonday() ? (day === 0 ? -6 : 1 - day) : -day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function timeToMinutes(t) {
  if (!t) return null
  var parts = t.split(':')
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
}

/* Reparte eventos solapados en columnas lado a lado (estilo Notion/Google):
   agrupa los que se pisan en un "clúster" y a cada uno le asigna una columna;
   todos los de un clúster comparten el mismo nº de columnas para repartir el
   ancho por igual. Devuelve [{ event, start, end, col, cols }]. */
function layoutDayEvents(timedEvents) {
  var items = timedEvents.map(function(e) {
    var s = timeToMinutes(e.start_time)
    if (s == null) return null
    var en = timeToMinutes(e.end_time)
    if (en == null || en <= s) en = s + 30
    return { event: e, start: s, end: en, col: 0 }
  }).filter(Boolean).sort(function(a, b) {
    return a.start - b.start || a.end - b.end
  })

  var out = []
  var cluster = []       // items del clúster actual
  var colEnds = []       // fin del último evento de cada columna
  var clusterEnd = -1

  function flush() {
    var cols = colEnds.length || 1
    cluster.forEach(function(it) {
      out.push({ event: it.event, start: it.start, end: it.end, col: it.col, cols: cols })
    })
    cluster = []; colEnds = []; clusterEnd = -1
  }

  items.forEach(function(it) {
    // si no se solapa con nada del clúster abierto, cerramos el clúster
    if (cluster.length && it.start >= clusterEnd) flush()
    var placed = -1
    for (var c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= it.start) { placed = c; break }
    }
    if (placed === -1) { placed = colEnds.length; colEnds.push(it.end) }
    else { colEnds[placed] = it.end }
    it.col = placed
    cluster.push(it)
    clusterEnd = Math.max(clusterEnd, it.end)
  })
  flush()
  return out
}

function hhmmLabel(m) {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}
// Minuto (desde medianoche) ajustado a 15' según la Y del cursor dentro de una
// columna de día, descontando dónde agarró el usuario el evento.
function dropMinutesFrom(clientY, rectTop, grabMin, dur) {
  var minutes = ((clientY - rectTop) / ROW_HEIGHT) * 60 - grabMin
  minutes = Math.round(minutes / 15) * 15
  return Math.max(0, Math.min(24 * 60 - dur, minutes)) + WEEK_HOUR_START * 60
}

/* ── Chip de evento en el calendario (vista mes) ──────────── */
function EventChip({ event, onClick }) {
  var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  return (
    <button type="button" onClick={function(e) { e.stopPropagation(); onClick(event) }}
      title={event.title}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden', padding: '2px 5px', borderRadius: '4px', background: cfg.bg, border: '1px solid ' + cfg.border, borderLeft: '2px solid ' + cfg.dot, cursor: 'pointer', marginBottom: '2px', textAlign: 'left', transition: 'all 0.1s' }}
      onMouseEnter={function(e) { e.currentTarget.style.filter = 'brightness(1.2)' }}
      onMouseLeave={function(e) { e.currentTarget.style.filter = 'none' }}
    >
      <span style={{ fontSize: '10px', fontWeight: 600, color: cfg.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
        {event.start_time ? fmtTime(event.start_time) + ' ' : ''}{event.title}
      </span>
    </button>
  )
}

/* ── Bloque de evento en la vista semanal ─────────────────── */
/* Bloque-guía que se pinta en el destino mientras arrastras: contorno de
   marca + la hora a la que caerá el evento (como en apps de calendario). */
function DropGhost({ startMin, dur, label }) {
  var top = ((startMin - WEEK_HOUR_START * 60) / 60) * ROW_HEIGHT
  var height = Math.max((dur / 60) * ROW_HEIGHT, 20)
  return (
    <div style={{
      position: 'absolute', left: '2px', right: '2px', top: top + 'px', height: height + 'px',
      border: '2px solid var(--brand)', background: 'var(--brand-dim)', borderRadius: '6px',
      zIndex: 6, pointerEvents: 'none', padding: '2px 6px', overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(230,57,70,0.35)',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand)', display: 'block', lineHeight: 1.2 }}>{hhmmLabel(startMin)}</span>
      {height > 30 && (
        <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--brand)', opacity: 0.85, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      )}
    </div>
  )
}

function WeekEventBlock({ event, startMin, endMin, col, cols, canDrag, onClick, onDragPointerDown }) {
  var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other

  var top    = ((startMin - WEEK_HOUR_START * 60) / 60) * ROW_HEIGHT
  var height = Math.max(((endMin - startMin) / 60) * ROW_HEIGHT, 20)

  // Reparto horizontal cuando hay solapes (estilo Notion): cada columna ocupa
  // 1/cols del ancho, con un pequeño hueco entre eventos contiguos.
  var gap = 3
  var widthCalc = 'calc((100% - 4px) / ' + cols + ' - ' + gap + 'px)'
  var leftCalc  = 'calc(2px + (100% - 4px) * ' + col + ' / ' + cols + ')'
  var compact = height < 34

  // Arrastre con pointer events (funciona con ratón Y dedo, a diferencia de
  // HTML5 drag). El padre distingue tap (editar) de arrastre (mover).
  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    var rect = e.currentTarget.getBoundingClientRect()
    var grabMin = ((e.clientY - rect.top) / ROW_HEIGHT) * 60
    onDragPointerDown(e, event, grabMin, endMin - startMin, e.currentTarget)
  }

  return (
    <button type="button"
      onClick={function(e) { e.stopPropagation(); if (!canDrag) onClick(event) }}
      onPointerDown={canDrag ? onPointerDown : undefined}
      title={(canDrag ? 'Arrastra para mover · ' : '') + event.title + ' · ' + fmtTime(event.start_time) + (event.end_time ? '–' + fmtTime(event.end_time) : '')}
      style={{
        position: 'absolute', left: leftCalc, width: widthCalc, top: top + 'px', height: height + 'px',
        background: cfg.bg, border: '1px solid ' + cfg.border, borderLeft: '3px solid ' + cfg.dot,
        borderRadius: '5px', padding: compact ? '1px 5px' : '3px 6px',
        textAlign: 'left', cursor: canDrag ? 'grab' : 'pointer', overflow: 'hidden', zIndex: 2,
        transition: 'filter 0.1s', touchAction: canDrag ? 'none' : undefined,
      }}
      onMouseEnter={function(e) { e.currentTarget.style.filter = 'brightness(1.25)'; e.currentTarget.style.zIndex = '5' }}
      onMouseLeave={function(e) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.zIndex = '2' }}
    >
      <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
        {event.title}
      </span>
      {!compact && (
        <span style={{ fontSize: '9px', color: cfg.text, opacity: 0.8, display: 'block' }}>
          {fmtTime(event.start_time)}{event.end_time ? '–' + fmtTime(event.end_time) : ''}
        </span>
      )}
    </button>
  )
}

/* ── Panel detalle de evento ──────────────────────────────── */
function EventDetail({ event, onClose, onEdit, onStatusChange, onDelete, isMobile }) {
  if (!event) return null
  var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  var sc  = STATUS_CFG[event.status] || STATUS_CFG.pending
  var StatusIcon = sc.icon

  return (
    <motion.div
      initial={isMobile ? { opacity: 0 } : { x: 320, opacity: 0 }}
      animate={isMobile ? { opacity: 1 } : { x: 0, opacity: 1 }}
      exit={isMobile ? { opacity: 0 } : { x: 320, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={isMobile
        ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,8,0.6)' }
        : { width: '300px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,8,0.6)' }
      }
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          {isMobile && (
            <button type="button" onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', marginBottom: '10px', padding: 0 }}
            ><ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver</button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.dot, boxShadow: '0 0 6px ' + cfg.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {event.event_type || 'evento'}
            </span>
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>{event.title}</h3>
        </div>
        {!isMobile && (
          <button type="button" onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          ><X style={{ width: '14px', height: '14px' }} /></button>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <CalendarIcon style={{ width: '15px', height: '15px', color: '#e63946', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{fmtDate(event.event_date)}</p>
            {(event.start_time || event.end_time) && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                {fmtTime(event.start_time)}{event.end_time ? ' — ' + fmtTime(event.end_time) : ''}
              </p>
            )}
          </div>
        </div>

        {event.description && (
          <div style={{ padding: '10px 12px', background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.1)', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            {event.description}
          </div>
        )}

        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin style={{ width: '15px', height: '15px', color: '#e63946', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{event.location}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusIcon style={{ width: '15px', height: '15px', color: sc.color, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{sc.label}</span>
        </div>

        {event.is_auto && (
          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            Este evento se genera solo desde {event.auto_kind === 'invoice' ? 'tus facturas' : 'tus suscripciones'}. Para cambiarlo, ve a esa sección.
          </div>
        )}

        {!event.is_auto && (
          <button type="button"
            onClick={function() { onEdit(event) }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
          ><Edit3 style={{ width: '13px', height: '13px' }} /> Editar evento</button>
        )}

        {!event.is_auto && event.status === 'pending' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button"
              onClick={function() { onStatusChange(event.id, 'completed') }}
              style={{ flex: 1, padding: '7px', borderRadius: '7px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >Completar</button>
            <button type="button"
              onClick={function() { onStatusChange(event.id, 'cancelled') }}
              style={{ flex: 1, padding: '7px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
          </div>
        )}

        {!event.is_auto && (
          <button type="button" onClick={function() { onDelete(event.id) }}
            style={{ width: '100%', padding: '7px', borderRadius: '7px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >Eliminar evento</button>
        )}
      </div>
    </motion.div>
  )
}

/* ── Panel agenda lateral ─────────────────────────────────── */
function AgendaPanel({ events, onEventClick, isMobile, onBack }) {
  var today     = new Date()
  var upcoming  = events
    .filter(function(e) { return new Date(e.event_date) >= today && e.status !== 'cancelled' })
    .sort(function(a, b) { return new Date(a.event_date) - new Date(b.event_date) })
    .slice(0, 8)

  var todayCount = events.filter(function(e) {
    return e.event_date === today.toISOString().split('T')[0] && e.status !== 'cancelled'
  }).length

  var monthCount = events.filter(function(e) {
    var d = new Date(e.event_date)
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && e.status !== 'cancelled'
  }).length

  return (
    <div style={isMobile
      ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,8,0.4)' }
      : { width: '240px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,8,0.4)' }
    }>

      {isMobile && (
        <div style={{ padding: '16px 16px 0' }}>
          <button type="button" onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', padding: 0 }}
          ><ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver al calendario</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Hoy', value: todayCount },
            { label: 'Este mes', value: monthCount },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ padding: '10px', background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.12)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 900, color: '#e63946', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Proximos eventos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Proximos eventos</p>

        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            Sin eventos proximos
          </div>
        ) : (
          upcoming.map(function(event) {
            var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
            var d   = new Date(event.event_date)
            return (
              <button key={event.id} type="button" onClick={function() { onEventClick(event) }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: '4px', transition: 'background 0.1s' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(230,57,70,0.06)' }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ flexShrink: 0, width: '32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#e63946', lineHeight: 1 }}>{d.getDate()}</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{MONTHS[d.getMonth()].slice(0, 3)}</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                  {event.start_time && <p style={{ fontSize: '11px', color: cfg.text, marginTop: '1px' }}>{fmtTime(event.start_time)}</p>}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Vista semanal ─────────────────────────────────────────── */
function WeekView({ weekStart, events, onEventClick, onSlotClick, onMoveEvent }) {
  var [dropHint, setDropHint] = useState(null)

  // Arrastre táctil/ratón: sigue el dedo por las 7 columnas usando
  // elementFromPoint, pinta el bloque-guía y, al soltar, mueve el evento.
  function beginDrag(e, event, grabMin, dur, blockEl) {
    e.stopPropagation()
    var startX = e.clientX, startY = e.clientY
    var moved = false
    var target = { date: null, min: null }
    function colFromPoint(x, y) {
      var el = document.elementFromPoint(x, y)
      var col = el && el.closest ? el.closest('[data-dayidx]') : null
      if (!col) return null
      return { el: col, idx: Number(col.getAttribute('data-dayidx')), date: col.getAttribute('data-date') }
    }
    function onMove(ev) {
      if (!moved) {
        if (Math.abs(ev.clientX - startX) < 6 && Math.abs(ev.clientY - startY) < 6) return
        moved = true
        if (blockEl) blockEl.style.opacity = '0.3'
      }
      ev.preventDefault()
      var col = colFromPoint(ev.clientX, ev.clientY)
      if (!col) return
      var rect = col.el.getBoundingClientRect()
      var startMin = dropMinutesFrom(ev.clientY, rect.top, grabMin, dur)
      target.date = col.date; target.min = startMin
      setDropHint({ dayIndex: col.idx, startMin: startMin, dur: dur, label: event.title })
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (blockEl) blockEl.style.opacity = ''
      setDropHint(null)
      if (!moved) { onEventClick(event); return } // tap = editar
      if (target.date != null && target.min != null && onMoveEvent) onMoveEvent(event.id, target.date, target.min)
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }
  var hours = []
  for (var h = WEEK_HOUR_START; h <= WEEK_HOUR_END; h++) hours.push(h)

  var days = Array.from({ length: 7 }).map(function(_, i) {
    var d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  var todayStr = toDateStr(new Date())

  function eventsForDay(dateStr) {
    return events.filter(function(e) { return e.event_date === dateStr })
  }

  // Al montar, desplaza la cuadrícula hasta la mañana (no arrancar en 00:00).
  var scrollRef = useRef(null)
  useEffect(function() {
    if (scrollRef.current) scrollRef.current.scrollTop = WEEK_SCROLL_TO_HOUR * ROW_HEIGHT
  }, [])

  // Línea de "ahora" para el día de hoy.
  var now = new Date()
  var nowTop = ((now.getHours() * 60 + now.getMinutes()) - WEEK_HOUR_START * 60) / 60 * ROW_HEIGHT

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, minmax(64px, 1fr))', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}>
        <div />
        {days.map(function(d, i) {
          var dateStr = toDateStr(d)
          var isToday = dateStr === todayStr
          return (
            <div key={i} style={{ padding: '10px 2px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>{daysArr()[i]}</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px', borderRadius: '50%',
                fontSize: '12px', fontWeight: isToday ? 800 : 500,
                background: isToday ? 'var(--gradient-brand)' : 'transparent',
                color: isToday ? '#fff' : 'rgba(255,255,255,0.7)',
                boxShadow: isToday ? '0 0 10px rgba(230,57,70,0.4)' : 'none',
              }}>{d.getDate()}</span>
            </div>
          )
        })}
      </div>

      {days.some(function(d) { return eventsForDay(toDateStr(d)).some(function(e) { return !e.start_time }) }) && (
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, minmax(64px, 1fr))', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, minHeight: '32px', overflowX: 'auto' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textAlign: 'right', paddingRight: '4px', paddingTop: '6px' }}>dia</div>
          {days.map(function(d, i) {
            var allDayEvents = eventsForDay(toDateStr(d)).filter(function(e) { return !e.start_time })
            return (
              <div key={i} style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {allDayEvents.map(function(e) {
                  var cfg = EVENT_COLORS[e.event_type] || EVENT_COLORS.other
                  return (
                    <button key={e.id} type="button" onClick={function() { onEventClick(e) }}
                      style={{ background: cfg.bg, border: '1px solid ' + cfg.border, borderRadius: '4px', padding: '2px 4px', fontSize: '9px', fontWeight: 600, color: cfg.text, textAlign: 'left', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{e.title}</button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, minmax(64px, 1fr))', position: 'relative', minWidth: '520px' }}>

          <div>
            {hours.map(function(h) {
              return (
                <div key={h} style={{ height: ROW_HEIGHT + 'px', textAlign: 'right', paddingRight: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.25)', position: 'relative', top: '-6px' }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              )
            })}
          </div>

          {days.map(function(d, i) {
            var dateStr = toDateStr(d)
            var isToday = dateStr === todayStr
            var timedEvents = eventsForDay(dateStr).filter(function(e) { return e.start_time })
            var laid = layoutDayEvents(timedEvents)
            return (
              <div key={i}
                data-dayidx={i}
                data-date={dateStr}
                onClick={function() { onSlotClick(dateStr) }}
                style={{ position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
              >
                {hours.map(function(h, hi) {
                  return <div key={h} style={{ height: ROW_HEIGHT + 'px', borderTop: hi === 0 ? 'none' : '1px solid rgba(255,255,255,0.03)' }} />
                })}
                {isToday && nowTop >= 0 && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: nowTop + 'px', borderTop: '2px solid #e63946', zIndex: 4, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '-3px', top: '-4px', width: '7px', height: '7px', borderRadius: '50%', background: '#e63946', boxShadow: '0 0 6px rgba(230,57,70,0.7)' }} />
                  </div>
                )}
                {dropHint && dropHint.dayIndex === i && (
                  <DropGhost startMin={dropHint.startMin} dur={dropHint.dur} label={dropHint.label} />
                )}
                {laid.map(function(item) {
                  var canDrag = !(item.event.is_auto || (typeof item.event.id === 'string' && item.event.id.indexOf('auto') === 0))
                  return (
                    <WeekEventBlock key={item.event.id} event={item.event}
                      startMin={item.start} endMin={item.end} col={item.col} cols={item.cols}
                      canDrag={canDrag}
                      onDragPointerDown={beginDrag}
                      onClick={onEventClick} />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Modal de nuevo/editar evento ─────────────────────────── */
function EventForm({ onSave, onCancel, loading, selectors, defaultDate, initial }) {
  var [form, setForm] = useState({
    title:      initial ? (initial.title || '') : '',
    event_date: initial ? initial.event_date : (defaultDate || new Date().toISOString().split('T')[0]),
    start_time: initial ? (initial.start_time || '') : '',
    end_time:   initial ? (initial.end_time || '') : '',
    event_type: initial ? (initial.event_type || 'meeting') : 'meeting',
    description: initial ? (initial.description || '') : '',
    location:   initial ? (initial.location || '') : '',
    client_id:  initial ? (initial.client_id || '') : '',
    project_id: initial ? (initial.project_id || '') : '',
  })

  function set(k) {
    return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) }
  }

  var INP = { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Título *</label>
        <input value={form.title} onChange={set('title')} placeholder="Nombre del evento" style={INP} autoFocus />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Fecha *</label>
        <input type="date" value={form.event_date} onChange={set('event_date')} style={INP} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Categoría</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.keys(CATEGORIES).map(function(key) {
            var c = CATEGORIES[key]
            var active = form.event_type === key
            return (
              <button key={key} type="button"
                onClick={function() { setForm(function(f) { return Object.assign({}, f, { event_type: key }) }) }}
                aria-pressed={active}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px',
                  border: '1px solid ' + (active ? c.color : 'var(--border)'),
                  background: active ? c.color + '22' : 'transparent',
                  color: active ? c.color : 'var(--text-3)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.12s' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Inicio</label>
          <input type="time" value={form.start_time} onChange={set('start_time')} style={INP} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Fin</label>
          <input type="time" value={form.end_time} onChange={set('end_time')} style={INP} />
        </div>
      </div>

      {selectors && selectors.clients && selectors.clients.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Cliente</label>
          <select value={form.client_id} onChange={set('client_id')} style={Object.assign({}, INP, { cursor: 'pointer' })}>
            <option value="">Sin cliente</option>
            {selectors.clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option> })}
          </select>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Ubicación</label>
        <input value={form.location} onChange={set('location')} placeholder="Direccion o enlace" style={INP} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Descripción</label>
        <textarea value={form.description} onChange={set('description')} placeholder="Notas adicionales..." rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} />
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
        <button type="button" onClick={onCancel}
          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >Cancelar</button>
        <button type="button" onClick={function() { onSave(form) }} disabled={loading || !form.title.trim() || !form.event_date}
          style={{ flex: 2, padding: '9px', borderRadius: '8px', background: form.title.trim() && !loading ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.06)', border: 'none', color: form.title.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.25)', fontSize: '13px', fontWeight: 700, cursor: form.title.trim() && !loading ? 'pointer' : 'not-allowed', boxShadow: form.title.trim() && !loading ? '0 4px 12px rgba(230,57,70,0.3)' : 'none' }}
        >{loading ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Crear evento')}</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════════════ */
/* ── Vista de día (al entrar en un día desde el mes) ───────── */
function DayView({ dateStr, events, onBack, onEventClick, onMoveEvent, onCreate }) {
  var hours = []
  for (var h = WEEK_HOUR_START; h <= WEEK_HOUR_END; h++) hours.push(h)

  var dayEvents = events.filter(function(e) { return e.event_date === dateStr })
  var timed  = dayEvents.filter(function(e) { return e.start_time })
  var allday = dayEvents.filter(function(e) { return !e.start_time })
  var laid = layoutDayEvents(timed)

  var scrollRef = useRef(null)
  useEffect(function() { if (scrollRef.current) scrollRef.current.scrollTop = WEEK_SCROLL_TO_HOUR * ROW_HEIGHT }, [])

  var now = new Date()
  var isToday = toDateStr(now) === dateStr
  var nowTop = ((now.getHours() * 60 + now.getMinutes()) - WEEK_HOUR_START * 60) / 60 * ROW_HEIGHT
  var label = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  var [dropHint, setDropHint] = useState(null)
  var colRef = useRef(null)
  function beginDrag(e, event, grabMin, dur, blockEl) {
    e.stopPropagation()
    var startX = e.clientX, startY = e.clientY
    var moved = false
    var targetMin = null
    function onMove(ev) {
      if (!moved) {
        if (Math.abs(ev.clientX - startX) < 6 && Math.abs(ev.clientY - startY) < 6) return
        moved = true
        if (blockEl) blockEl.style.opacity = '0.3'
      }
      ev.preventDefault()
      if (!colRef.current) return
      var rect = colRef.current.getBoundingClientRect()
      var startMin = dropMinutesFrom(ev.clientY, rect.top, grabMin, dur)
      targetMin = startMin
      setDropHint({ startMin: startMin, dur: dur, label: event.title })
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (blockEl) blockEl.style.opacity = ''
      setDropHint(null)
      if (!moved) { onEventClick(event); return }
      if (targetMin != null && onMoveEvent) onMoveEvent(event.id, dateStr, targetMin)
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: '15px', height: '15px' }} /> Mes
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', textTransform: 'capitalize' }}>{label}</span>
        <button type="button" onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'var(--gradient-brand)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
          <Plus style={{ width: '13px', height: '13px' }} /> Nuevo
        </button>
      </div>

      {allday.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {allday.map(function(e) {
            var cfg = EVENT_COLORS[e.event_type] || EVENT_COLORS.other
            return (
              <button key={e.id} type="button" onClick={function() { onEventClick(e) }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: cfg.bg, border: '1px solid ' + cfg.border, color: cfg.text, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot }} /> {e.title}
              </button>
            )
          })}
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', position: 'relative' }}>
          <div>
            {hours.map(function(h) {
              return <div key={h} style={{ height: ROW_HEIGHT + 'px', textAlign: 'right', paddingRight: '6px', fontSize: '10px', color: 'var(--text-5)', position: 'relative', top: '-6px' }}>{String(h).padStart(2, '0')}:00</div>
            })}
          </div>
          <div ref={colRef} onClick={onCreate}
            style={{ position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
            {hours.map(function(h, hi) {
              return <div key={h} style={{ height: ROW_HEIGHT + 'px', borderTop: hi === 0 ? 'none' : '1px solid rgba(255,255,255,0.03)' }} />
            })}
            {isToday && nowTop >= 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: nowTop + 'px', borderTop: '2px solid #e63946', zIndex: 4, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '-3px', top: '-4px', width: '7px', height: '7px', borderRadius: '50%', background: '#e63946', boxShadow: '0 0 6px rgba(230,57,70,0.7)' }} />
              </div>
            )}
            {dropHint && (
              <DropGhost startMin={dropHint.startMin} dur={dropHint.dur} label={dropHint.label} />
            )}
            {laid.map(function(item) {
              var canDrag = !(item.event.is_auto || (typeof item.event.id === 'string' && item.event.id.indexOf('auto') === 0))
              return <WeekEventBlock key={item.event.id} event={item.event} startMin={item.start} endMin={item.end} col={item.col} cols={item.cols} canDrag={canDrag} onDragPointerDown={beginDrag} onClick={onEventClick} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  var hook = useCalendar()
  var [selectedEvent, setSelectedEvent] = useState(null)
  var [viewMode, setViewMode] = useState('month')
  var [weekStart, setWeekStart] = useState(function() { return getMonday(new Date()) })
  var [dayView, setDayView] = useState(null) // fecha (YYYY-MM-DD) al entrar en un día desde el mes

  // Navegación móvil: 'calendar' | 'agenda' | 'detail'
  var [mobileStep, setMobileStep] = useState('calendar')
  var [isMobile, setIsMobile] = useState(false)
  useEffect(function() {
    var mq = window.matchMedia('(max-width: 768px)')
    function update() { setIsMobile(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return function() { mq.removeEventListener('change', update) }
  }, [])

  var today  = new Date()
  var year   = hook.currentYear  || today.getFullYear()
  var month  = hook.currentMonth !== undefined ? hook.currentMonth : today.getMonth()

  var daysInMonth  = getDaysInMonth(year, month)
  var firstDayIdx  = getFirstDayOfMonth(year, month)

  var todayStr = today.toISOString().split('T')[0]

  function getEventsForDay(day) {
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    return (hook.events || []).filter(function(e) { return e.event_date === dateStr })
  }

  function handleDayClick(day) {
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    setSelectedEvent(null)
    setDayView(dateStr) // entrar en el día para ver sus eventos
  }

  function isAutoEvent(event) {
    return event.is_auto || event._readonly || (typeof event.id === 'string' && event.id.indexOf('auto') === 0)
  }

  function handleEventClick(event) {
    // Click en un evento manual = editar directamente. Los automáticos
    // (deadlines de proyecto, cobros) no son editables: se muestran en detalle.
    if (isAutoEvent(event)) {
      setSelectedEvent(event)
      if (isMobile) setMobileStep('detail')
    } else {
      hook.openEditModal(event)
    }
  }

  // Mover un evento (arrastrando en la vista de semana/día) a otro día/hora,
  // conservando su duración. Sin tocar la fecha a mano.
  function moveEvent(eventId, newDateStr, newStartMin) {
    var ev = (hook.events || []).find(function(e) { return e.id === eventId })
    if (!ev || isAutoEvent(ev)) return
    var s0 = timeToMinutes(ev.start_time)
    var e0 = timeToMinutes(ev.end_time)
    var dur = (s0 != null && e0 != null && e0 > s0) ? (e0 - s0) : 30
    var ns = Math.max(0, Math.min(24 * 60 - dur, newStartMin))
    var ne = ns + dur
    function hhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }
    hook.handleUpdate(eventId, {
      title: ev.title, event_type: ev.event_type, status: ev.status,
      event_date: newDateStr, start_time: hhmm(ns), end_time: hhmm(ne),
      description: ev.description, location: ev.location,
      client_id: ev.client_id, project_id: ev.project_id,
    })
  }

  function handleEditClick(event) {
    hook.openEditModal(event)
  }

  function prevWeek() {
    setWeekStart(function(w) { var d = new Date(w); d.setDate(d.getDate() - 7); return d })
  }
  function nextWeek() {
    setWeekStart(function(w) { var d = new Date(w); d.setDate(d.getDate() + 7); return d })
  }
  function goToTodayWeek() {
    setWeekStart(getMonday(new Date()))
  }

  var weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  var sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  var weekLabel = sameMonth
    ? weekStart.getDate() + ' – ' + weekEnd.getDate() + ' ' + MONTHS[weekStart.getMonth()].slice(0, 3) + ' ' + weekStart.getFullYear()
    : weekStart.getDate() + ' ' + MONTHS[weekStart.getMonth()].slice(0, 3) + ' – ' + weekEnd.getDate() + ' ' + MONTHS[weekEnd.getMonth()].slice(0, 3) + ' ' + weekEnd.getFullYear()

  var showCalendarPane = !isMobile || mobileStep === 'calendar'
  var showSidePane     = !isMobile || mobileStep === 'agenda' || mobileStep === 'detail'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Calendario"
        description="Agenda, rodajes y fechas clave"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {isMobile && (
              <button type="button" onClick={function() { setSelectedEvent(null); setMobileStep('agenda') }}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              ><ListTodo style={{ width: '15px', height: '15px' }} /></button>
            )}
            <Button
              icon={<Plus style={{ width: '15px', height: '15px' }} />}
              onClick={function() { setSelectedEvent(null); hook.openModal && hook.openModal(viewMode === 'week' ? toDateStr(weekStart) : todayStr) }}
            >
              Nuevo evento
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* GRILLA CALENDARIO */}
        {showCalendarPane && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {/* Navegacion */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, flexWrap: 'wrap' }}>
              <button type="button" onClick={function() { setDayView(null); viewMode === 'week' ? prevWeek() : hook.prevMonth() }}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              ><ChevronLeft style={{ width: '15px', height: '15px' }} /></button>

              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', minWidth: '110px', textAlign: 'center', flexShrink: 0 }}>
                {viewMode === 'week' ? weekLabel : MONTHS[month] + ' ' + year}
              </h2>

              <button type="button" onClick={function() { setDayView(null); viewMode === 'week' ? nextWeek() : hook.nextMonth() }}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              ><ChevronRight style={{ width: '15px', height: '15px' }} /></button>

              <button type="button" onClick={function() { setDayView(null); viewMode === 'week' ? goToTodayWeek() : hook.goToToday() }}
                style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >Hoy</button>

              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px', marginLeft: isMobile ? '0' : 'auto', flexShrink: 0 }}>
                {[{ id: 'month', label: 'Mes' }, { id: 'week', label: 'Semana' }].map(function(v) {
                  var active = viewMode === v.id
                  return (
                    <button key={v.id} type="button" onClick={function() { setDayView(null); setViewMode(v.id) }}
                      style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? 'var(--gradient-brand)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}
                    >{v.label}</button>
                  )
                })}
              </div>
            </div>

            {viewMode === 'week' ? (
              <WeekView
                weekStart={weekStart}
                events={hook.events || []}
                onEventClick={handleEventClick}
                onSlotClick={function(dateStr) { setSelectedEvent(null); hook.openModal && hook.openModal(dateStr) }}
                onMoveEvent={moveEvent}
              />
            ) : dayView ? (
              <DayView
                dateStr={dayView}
                events={hook.events || []}
                onBack={function() { setDayView(null) }}
                onEventClick={handleEventClick}
                onMoveEvent={moveEvent}
                onCreate={function() { hook.openModal && hook.openModal(dayView) }}
              />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  {daysArr().map(function(day) {
                    return (
                      <div key={day} style={{ padding: '8px 2px', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {isMobile ? day.slice(0, 1) : day}
                      </div>
                    )
                  })}
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: isMobile ? 'minmax(64px, 1fr)' : 'minmax(90px, 1fr)', height: '100%' }}>
                    {Array.from({ length: firstDayIdx }).map(function(_, i) {
                      return (
                        <div key={'empty-' + i} style={{ border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none', borderLeft: 'none', background: 'rgba(255,255,255,0.01)' }} />
                      )
                    })}

                    {Array.from({ length: daysInMonth }).map(function(_, i) {
                      var day     = i + 1
                      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
                      var isToday = dateStr === todayStr
                      var dayEvents = getEventsForDay(day)

                      return (
                        <div key={day}
                          onClick={function() { handleDayClick(day) }}
                          style={{
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderTop: 'none',
                            borderLeft: 'none',
                            padding: isMobile ? '3px' : '6px',
                            cursor: 'pointer',
                            background: isToday ? 'rgba(230,57,70,0.06)' : 'transparent',
                            transition: 'background 0.1s',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minWidth: 0,
                          }}
                          onMouseEnter={function(e) { if (!isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                          onMouseLeave={function(e) { if (!isToday) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span style={{
                              width: isMobile ? '18px' : '22px', height: isMobile ? '18px' : '22px',
                              borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: isMobile ? '10px' : '11px', fontWeight: isToday ? 800 : 500,
                              background: isToday ? 'var(--gradient-brand)' : 'transparent',
                              color: isToday ? '#ffffff' : 'rgba(255,255,255,0.5)',
                              boxShadow: isToday ? '0 0 10px rgba(230,57,70,0.4)' : 'none',
                            }}>
                              {day}
                            </span>
                          </div>

                          <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
                            {dayEvents.slice(0, isMobile ? 2 : 3).map(function(event) {
                              return <EventChip key={event.id} event={event} onClick={handleEventClick} />
                            })}
                            {dayEvents.length > (isMobile ? 2 : 3) && (
                              <span style={{ display: 'block', fontSize: '9px', color: 'var(--brand)', fontWeight: 600, paddingLeft: '4px' }}>+{dayEvents.length - (isMobile ? 2 : 3)} más</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* PANEL LATERAL */}
        {showSidePane && (
          <AnimatePresence>
            {selectedEvent ? (
              <EventDetail
                key="detail"
                event={selectedEvent}
                isMobile={isMobile}
                onClose={function() { setSelectedEvent(null); if (isMobile) setMobileStep('calendar') }}
                onEdit={function(event) {
                  handleEditClick(event)
                  setSelectedEvent(null)
                  if (isMobile) setMobileStep('calendar')
                }}
                onStatusChange={function(id, status) {
                  hook.updateEventStatus && hook.updateEventStatus(id, status)
                  setSelectedEvent(function(prev) { return prev ? Object.assign({}, prev, { status: status }) : prev })
                }}
                onDelete={function(id) {
                  hook.deleteEvent && hook.deleteEvent(id)
                  setSelectedEvent(null)
                  if (isMobile) setMobileStep('calendar')
                }}
              />
            ) : (
              <AgendaPanel
                key="agenda"
                events={hook.events || []}
                onEventClick={handleEventClick}
                isMobile={isMobile}
                onBack={function() { setMobileStep('calendar') }}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal nuevo/editar evento */}
      <Modal
        open={hook.modalOpen || false}
        onClose={hook.closeModal}
        title={hook.editingEvent ? 'Editar evento' : 'Nuevo evento'}
        description={hook.editingEvent ? 'Modifica los datos del evento' : 'Añade un evento a tu calendario'}
        size="md"
      >
        <EventForm
          initial={hook.editingEvent}
          onSave={function(form) {
            if (hook.editingEvent) {
              hook.handleUpdate(hook.editingEvent.id, form)
            } else {
              hook.handleCreate(form)
            }
          }}
          onCancel={hook.closeModal}
          loading={hook.formLoading || false}
          selectors={hook.selectors}
          defaultDate={hook.selectedDate}
        />
      </Modal>
    </div>
  )
}