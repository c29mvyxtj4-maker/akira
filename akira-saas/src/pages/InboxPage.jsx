import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Inbox, CheckCheck, AtSign } from 'lucide-react'
import { getMyMentions, markMentionRead, markAllMentionsRead } from '@/services/mentions.service'
import { DUR, EASE } from '@/shared/config/motion'

function fmtWhen(iso) {
  if (!iso) return ''
  var d = new Date(iso)
  var mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return 'hace ' + mins + ' min'
  if (mins < 1440) return 'hace ' + Math.floor(mins / 60) + ' h'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export default function InboxPage() {
  var navigate = useNavigate()
  var [items, setItems] = useState([])
  var [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    getMyMentions().then(setItems).catch(function () {}).finally(function () { setLoading(false) })
  }
  // Al abrir la bandeja se marcan todas como leÃ­das: asÃ­ la insignia de Inicio
  // se limpia y no queda un contador "fantasma" colgado. Las filas mantienen su
  // estilo leÃ­do/no-leÃ­do de esta vista porque no recargamos.
  useEffect(function () {
    load()
    markAllMentionsRead().catch(function () {})
  }, [])

  function open(m) {
    if (!m.read) markMentionRead(m.id).then(load).catch(function () {})
    if (m.project_id) navigate('/projects')
  }
  function markAll() { markAllMentionsRead().then(load).catch(function () {}) }

  function initialOf(a) { return ((a && a.full_name) ? a.full_name[0] : '?').toUpperCase() }
  var unread = items.filter(function (m) { return !m.read }).length

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-base)', paddingTop: 'calc(var(--safe-top) + 14px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px calc(var(--safe-bottom) + 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox style={{ width: '22px', height: '22px', color: 'var(--brand)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Bandeja</h1>
            {unread > 0 && <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: 'var(--brand)', borderRadius: '999px', padding: '2px 8px' }}>{unread}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unread > 0 && (
              <button type="button" onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 10px', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                <CheckCheck style={{ width: '14px', height: '14px' }} /> Marcar todo
              </button>
            )}
            <button type="button" onClick={function () { navigate(-1) }} aria-label="Volver atrÃ¡s" title="Volver atrÃ¡s"
              style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: '14px', color: 'var(--text-4)' }}>Cargandoâ€¦</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-4)' }}>
            <AtSign style={{ width: '30px', height: '30px', margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>Nada por aquÃ­ todavÃ­a.</p>
            <p style={{ fontSize: '12px', color: 'var(--text-5)', marginTop: '4px' }}>Cuando te asignen una tarea o te aÃ±adan a un proyecto, aparecerÃ¡ aquÃ­.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map(function (m, i) {
              return (
                <motion.button key={m.id} type="button" onClick={function () { open(m) }}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03, duration: DUR.slow, ease: EASE.out }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: m.read ? 'transparent' : 'var(--bg-2)', border: '1px solid ' + (m.read ? 'transparent' : 'var(--border)') }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>{initialOf(m.actor)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.45 }}>{m.text}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '3px' }}>{fmtWhen(m.created_at)}</p>
                  </div>
                  {!m.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: '6px' }} />}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

