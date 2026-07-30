import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Megaphone, MessageSquare, Trash2 } from 'lucide-react'
import { useOrg } from '@/context/OrgContext'
import { useAuth } from '@/context/AuthContext'
import { getOrgTeam } from '@/services/projectMembers.service'
import {
  getTeamMessages, sendTeamMessage, subscribeTeamMessages,
  getAnnouncements, postAnnouncement, deleteAnnouncement, subscribeAnnouncements,
} from '@/services/messages.service'

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Mensajes() {
  var navigate = useNavigate()
  var { org, isOwner } = useOrg()
  var { user } = useAuth()
  var me = user && user.id
  var orgId = org && org.id

  var [tab, setTab] = useState('chat')
  var [team, setTeam] = useState({})       // userId -> profile
  var [messages, setMessages] = useState([])
  var [anns, setAnns] = useState([])
  var [draft, setDraft] = useState('')
  var [annTitle, setAnnTitle] = useState('')
  var [annBody, setAnnBody] = useState('')
  var endRef = useRef(null)

  // Mapa de nombres del equipo.
  useEffect(function () {
    if (!orgId) return
    getOrgTeam(orgId).then(function (rows) {
      var map = {}
      rows.forEach(function (r) { map[r.user_id] = r.profile })
      setTeam(map)
    }).catch(function () {})
  }, [orgId])

  // Carga + realtime del chat.
  useEffect(function () {
    if (!orgId) return
    getTeamMessages(orgId).then(setMessages).catch(function () {})
    var unsub = subscribeTeamMessages(orgId, function (m) {
      setMessages(function (prev) { return prev.some(function (x) { return x.id === m.id }) ? prev : prev.concat([m]) })
    })
    return unsub
  }, [orgId])

  // Carga + realtime de anuncios.
  useEffect(function () {
    if (!orgId) return
    getAnnouncements(orgId).then(setAnns).catch(function () {})
    var unsub = subscribeAnnouncements(orgId, function (a) {
      setAnns(function (prev) { return prev.some(function (x) { return x.id === a.id }) ? prev : [a].concat(prev) })
    })
    return unsub
  }, [orgId])

  useEffect(function () { if (endRef.current && tab === 'chat') endRef.current.scrollIntoView({ behavior: 'smooth' }) }, [messages, tab])

  function nameOf(uid) { var p = team[uid]; return (p && p.full_name) || (uid === me ? 'Tú' : 'Miembro') }
  function initialOf(uid) { var n = nameOf(uid); return (n[0] || '?').toUpperCase() }

  function send() {
    var t = draft.trim()
    if (!t || !orgId) return
    setDraft('')
    sendTeamMessage(orgId, t).catch(function (e) { window.alert('No se pudo enviar: ' + (e.message || e)) })
  }
  function publish() {
    var b = annBody.trim()
    if (!b || !orgId) return
    setAnnTitle(''); setAnnBody('')
    postAnnouncement(orgId, annTitle.trim(), b).catch(function (e) { window.alert('No se pudo publicar: ' + (e.message || e)) })
  }
  function removeAnn(id) {
    if (!window.confirm('¿Eliminar este anuncio?')) return
    deleteAnnouncement(id).then(function () { setAnns(function (prev) { return prev.filter(function (a) { return a.id !== id }) }) }).catch(function () {})
  }

  var TABS = [{ id: 'chat', label: 'Chat', icon: MessageSquare }, { id: 'announce', label: 'Anuncios', icon: Megaphone }]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', paddingTop: 'calc(var(--safe-top) + 14px)' }}>
      <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        <button type="button" onClick={function () { navigate('/inicio') }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', marginBottom: '14px' }}>
          <ChevronLeft style={{ width: '16px', height: '16px' }} /> Inicio
        </button>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-3)', borderRadius: '10px', padding: '4px', alignSelf: 'flex-start', marginBottom: '14px' }}>
          {TABS.map(function (t) {
            var Icon = t.icon
            var active = tab === t.id
            return (
              <button key={t.id} type="button" onClick={function () { setTab(t.id) }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: active ? 'var(--gradient-brand)' : 'transparent', color: active ? '#fff' : 'var(--text-4)' }}>
                <Icon style={{ width: '14px', height: '14px' }} /> {t.label}
              </button>
            )
          })}
        </div>

        {!orgId ? (
          <p style={{ fontSize: '14px', color: 'var(--text-4)' }}>Cargando tu organización…</p>
        ) : tab === 'chat' ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
              {messages.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-5)', textAlign: 'center', paddingTop: '32px' }}>Aún no hay mensajes. Escribe el primero.</p>
              ) : messages.map(function (m) {
                var mine = m.user_id === me
                return (
                  <div key={m.id} style={{ display: 'flex', gap: '8px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: mine ? 'var(--gradient-brand)' : 'var(--bg-4)', color: mine ? '#fff' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{initialOf(m.user_id)}</span>
                    <div style={{ maxWidth: '78%' }}>
                      <div style={{ padding: '8px 12px', borderRadius: '12px', background: mine ? 'var(--brand-dim)' : 'var(--bg-2)', border: '1px solid ' + (mine ? 'var(--brand-border)' : 'var(--border)'), color: 'var(--text-1)', fontSize: '13px', lineHeight: 1.45, wordBreak: 'break-word' }}>{m.text}</div>
                      <p style={{ fontSize: '10px', color: 'var(--text-5)', marginTop: '2px', textAlign: mine ? 'right' : 'left' }}>{mine ? '' : nameOf(m.user_id) + ' · '}{fmtTime(m.created_at)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '10px 0 calc(var(--safe-bottom) + 12px)', flexShrink: 0 }}>
              <input value={draft} onChange={function (e) { setDraft(e.target.value) }}
                onKeyDown={function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Escribe un mensaje…" className="input-base" style={{ flex: 1, height: '42px' }} />
              <button type="button" onClick={send} aria-label="Enviar"
                style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient-brand)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send style={{ width: '17px', height: '17px' }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(var(--safe-bottom) + 24px)', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
            {isOwner && (
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Publicar anuncio</p>
                <input value={annTitle} onChange={function (e) { setAnnTitle(e.target.value) }} placeholder="Título (opcional)" className="input-base" style={{ height: '38px' }} />
                <textarea value={annBody} onChange={function (e) { setAnnBody(e.target.value) }} placeholder="Escribe el anuncio para tu equipo…" rows={3} className="input-base" style={{ resize: 'vertical' }} />
                <button type="button" onClick={publish} className="btn-base bg-brand-500 hover:bg-brand-600 text-white h-9 self-end px-4 text-sm">Publicar</button>
              </div>
            )}
            {anns.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-5)', textAlign: 'center', paddingTop: '24px' }}>No hay anuncios todavía.{isOwner ? '' : ' Aquí verás lo que publique tu responsable.'}</p>
            ) : anns.map(function (a) {
              return (
                <div key={a.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    {a.title && <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{a.title}</p>}
                    {isOwner && <button type="button" onClick={function () { removeAnn(a.id) }} aria-label="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-5)', flexShrink: 0 }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginTop: a.title ? '4px' : 0 }}>{a.body}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '8px' }}>{nameOf(a.author_id)} · {fmtDate(a.created_at)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
