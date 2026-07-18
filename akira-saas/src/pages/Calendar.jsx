import { useState, useEffect } from 'react'
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
import clsx from 'clsx'

var DAYS   = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM']
var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

var EVENT_COLORS = {
  meeting:     { bg: 'rgba(230,57,70,0.15)',  border: 'rgba(230,57,70,0.4)',  text: '#e63946',  dot: '#e63946' },
  deadline:    { bg: 'rgba(180,30,40,0.15)',  border: 'rgba(180,30,40,0.4)',  text: '#cc2936',  dot: '#cc2936' },
  delivery:    { bg: 'rgba(255,100,100,0.12)', border: 'rgba(255,100,100,0.3)', text: '#ff6464', dot: '#ff6464' },
  billing:     { bg: 'rgba(200,50,60,0.12)',  border: 'rgba(200,50,60,0.3)',  text: '#e05060',  dot: '#e05060' },
  other:       { bg: 'rgba(230,57,70,0.08)',  border: 'rgba(230,57,70,0.2)',  text: '#e63946',  dot: '#e63946' },
  project_due: { bg: 'rgba(180,30,40,0.12)',  border: 'rgba(180,30,40,0.3)',  text: '#cc2936',  dot: '#cc2936' },
  sub_billing: { bg: 'rgba(200,50,60,0.1)',   border: 'rgba(200,50,60,0.25)', text: '#e05060',  dot: '#e05060' },
}

var STATUS_CFG = {
  pending:   { icon: Circle,      color: 'rgba(255,255,255,0.4)', label: 'Pendiente' },
  completed: { icon: CheckCircle, color: '#e63946',               label: 'Completado' },
  cancelled: { icon: X,           color: 'rgba(255,255,255,0.25)', label: 'Cancelado' },
}

var WEEK_HOUR_START = 7
var WEEK_HOUR_END   = 22
var ROW_HEIGHT       = 52

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  var day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
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

function getMonday(date) {
  var d = new Date(date)
  var day = d.getDay()
  var diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function timeToMinutes(t) {
  if (!t) return null
  var parts = t.split(':')
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
}

/* ── Chip de evento en el calendario (vista mes) ──────────── */
function EventChip({ event, onClick }) {
  var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  return (
    <button type="button" onClick={function(e) { e.stopPropagation(); onClick(event) }}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', padding: '2px 5px', borderRadius: '4px', background: cfg.bg, border: '1px solid ' + cfg.border, cursor: 'pointer', marginBottom: '2px', textAlign: 'left', transition: 'all 0.1s' }}
      onMouseEnter={function(e) { e.currentTarget.style.filter = 'brightness(1.2)' }}
      onMouseLeave={function(e) { e.currentTarget.style.filter = 'none' }}
    >
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      <span style={{ fontSize: '10px', fontWeight: 600, color: cfg.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {event.start_time ? fmtTime(event.start_time) + ' ' : ''}{event.title}
      </span>
    </button>
  )
}

/* ── Bloque de evento en la vista semanal ─────────────────── */
function WeekEventBlock({ event, onClick }) {
  var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
  var startMin = timeToMinutes(event.start_time) || (WEEK_HOUR_START * 60)
  var endMin   = timeToMinutes(event.end_time)   || (startMin + 30)
  if (endMin <= startMin) endMin = startMin + 30

  var top    = ((startMin - WEEK_HOUR_START * 60) / 60) * ROW_HEIGHT
  var height = Math.max(((endMin - startMin) / 60) * ROW_HEIGHT, 22)

  return (
    <button type="button" onClick={function(e) { e.stopPropagation(); onClick(event) }}
      style={{
        position: 'absolute', left: '2px', right: '2px', top: top + 'px', height: height + 'px',
        background: cfg.bg, border: '1px solid ' + cfg.border, borderRadius: '5px',
        padding: '3px 6px', textAlign: 'left', cursor: 'pointer', overflow: 'hidden', zIndex: 2,
        transition: 'filter 0.1s',
      }}
      onMouseEnter={function(e) { e.currentTarget.style.filter = 'brightness(1.25)' }}
      onMouseLeave={function(e) { e.currentTarget.style.filter = 'none' }}
    >
      <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.title}
      </span>
      {height > 32 && (
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
function WeekView({ weekStart, events, onEventClick, onSlotClick }) {
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, minmax(64px, 1fr))', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}>
        <div />
        {days.map(function(d, i) {
          var dateStr = toDateStr(d)
          var isToday = dateStr === todayStr
          return (
            <div key={i} style={{ padding: '10px 2px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>{DAYS[i]}</p>
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

      <div style={{ flex: 1, overflow: 'auto' }}>
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
            var timedEvents = eventsForDay(dateStr).filter(function(e) { return e.start_time })
            return (
              <div key={i}
                onClick={function() { onSlotClick(dateStr) }}
                style={{ position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
              >
                {hours.map(function(h, hi) {
                  return <div key={h} style={{ height: ROW_HEIGHT + 'px', borderTop: hi === 0 ? 'none' : '1px solid rgba(255,255,255,0.03)' }} />
                })}
                {timedEvents.map(function(e) {
                  return <WeekEventBlock key={e.id} event={e} onClick={onEventClick} />
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
  var TYPES = ['meeting','deadline','delivery','billing','other']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Título *</label>
        <input value={form.title} onChange={set('title')} placeholder="Nombre del evento" style={INP} autoFocus />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Fecha *</label>
          <input type="date" value={form.event_date} onChange={set('event_date')} style={INP} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Tipo</label>
          <select value={form.event_type} onChange={set('event_type')} style={Object.assign({}, INP, { cursor: 'pointer' })}>
            {TYPES.map(function(t) { return <option key={t} value={t}>{t}</option> })}
          </select>
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
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Ubicacion</label>
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
export default function Calendar() {
  var hook = useCalendar()
  var [selectedEvent, setSelectedEvent] = useState(null)
  var [viewMode, setViewMode] = useState('month')
  var [weekStart, setWeekStart] = useState(function() { return getMonday(new Date()) })

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
    hook.openModal && hook.openModal(dateStr)
  }

  function handleEventClick(event) {
    setSelectedEvent(event)
    if (isMobile) setMobileStep('detail')
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
              <button type="button" onClick={viewMode === 'week' ? prevWeek : hook.prevMonth}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              ><ChevronLeft style={{ width: '15px', height: '15px' }} /></button>

              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', minWidth: '110px', textAlign: 'center', flexShrink: 0 }}>
                {viewMode === 'week' ? weekLabel : MONTHS[month] + ' ' + year}
              </h2>

              <button type="button" onClick={viewMode === 'week' ? nextWeek : hook.nextMonth}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              ><ChevronRight style={{ width: '15px', height: '15px' }} /></button>

              <button type="button" onClick={function() { viewMode === 'week' ? goToTodayWeek() : hook.goToToday() }}
                style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >Hoy</button>

              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px', marginLeft: isMobile ? '0' : 'auto', flexShrink: 0 }}>
                {[{ id: 'month', label: 'Mes' }, { id: 'week', label: 'Semana' }].map(function(v) {
                  var active = viewMode === v.id
                  return (
                    <button key={v.id} type="button" onClick={function() { setViewMode(v.id) }}
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
              />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  {DAYS.map(function(day) {
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

                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            {isMobile ? (
                              dayEvents.length > 0 && (
                                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                  {dayEvents.slice(0, 4).map(function(event) {
                                    var cfg = EVENT_COLORS[event.event_type] || EVENT_COLORS.other
                                    return <div key={event.id} onClick={function(e) { e.stopPropagation(); handleEventClick(event) }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
                                  })}
                                </div>
                              )
                            ) : (
                              <>
                                {dayEvents.slice(0, 3).map(function(event) {
                                  return <EventChip key={event.id} event={event} onClick={handleEventClick} />
                                })}
                                {dayEvents.length > 3 && (
                                  <span style={{ fontSize: '9px', color: '#e63946', fontWeight: 600, paddingLeft: '5px' }}>+{dayEvents.length - 3} mas</span>
                                )}
                              </>
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