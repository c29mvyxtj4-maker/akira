import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Send, Trash2, Mail, Eye, EyeOff,
  FileText, Check, X, Clock, AlertTriangle,
  Upload, Download, MessageSquare, Settings,
  ExternalLink, Copy, RefreshCw,
} from 'lucide-react'
import {
  getPortalUsers, createPortalUser, deletePortalUser,
  updatePortalPermission, sendPortalInvite,
  getPortalMessages, sendOwnerMessage, markMessagesAsRead,
  getPortalFiles, uploadPortalFile, deletePortalFile,
  getPortalApprovals, createPortalApproval, updatePortalApproval, deletePortalApproval,
  getPortalClientData, getPortalBranding,
} from '@/services/portal.service'
import { supabase } from '@/lib/supabase'
import EmptyState from '@/shared/components/ui/EmptyState'
import Spinner    from '@/shared/components/ui/Spinner'
import PortalView from '@/components/portal/PortalView'

var PORTAL_URL = window.location.origin + '/portal'

var STATUS_CFG = {
  pending:  { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  approved: { label: 'Aprobado',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  rejected: { label: 'Rechazado', color: '#e63946', bg: 'rgba(230,57,70,0.1)' },
  revision: { label: 'Revision',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
}

function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtSize(b) {
  if (!b) return '0 B'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

function fileIcon(type) {
  if (!type) return 'ðŸ“Ž'
  if (type.startsWith('image/'))  return 'ðŸ–¼'
  if (type === 'application/pdf') return 'ðŸ“„'
  if (type.includes('word'))      return 'ðŸ“'
  if (type.startsWith('video/'))  return 'ðŸŽ¬'
  if (type.startsWith('audio/'))  return 'ðŸŽµ'
  return 'ðŸ“Ž'
}

/* –”€–”€ Sección: Usuarios del portal –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function UsersSection({ clientId, clientName }) {
  var [users,   setUsers]   = useState([])
  var [loading, setLoading] = useState(true)
  var [email,   setEmail]   = useState('')
  var [name,    setName]    = useState('')
  var [adding,  setAdding]  = useState(false)
  var [sending, setSending] = useState({})
  var [toast,   setToast]   = useState(null)
  var [showForm, setShowForm] = useState(false)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    setLoading(true)
    getPortalUsers(clientId)
      .then(function(data) { setUsers(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [clientId])

  function handleAdd() {
    if (!email.trim()) return
    setAdding(true)
    createPortalUser(clientId, email.trim(), name.trim())
      .then(function(u) {
        setUsers(function(prev) { return [u].concat(prev) })
        setEmail(''); setName(''); setShowForm(false)
        showMsg('Usuario creado')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setAdding(false) })
  }

  function handleInvite(user) {
  setSending(function(prev) { return Object.assign({}, prev, { [user.id]: true }) })
  var portalUrl = window.location.origin + '/portal'
  sendPortalInvite(user.email, clientName, portalUrl)
    .then(function() { showMsg('Invitacion enviada a ' + user.email) })
    .catch(function(e) {
      console.error('Invite error:', e)
      showMsg('Error: ' + (e.message || JSON.stringify(e)), 'error')
    })
    .finally(function() { setSending(function(prev) { return Object.assign({}, prev, { [user.id]: false }) }) })
}

  function handleDelete(id) {
    if (!window.confirm('Eliminar acceso de este usuario?')) return
    deletePortalUser(id)
      .then(function() {
        setUsers(function(prev) { return prev.filter(function(u) { return u.id !== id }) })
        showMsg('Usuario eliminado')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleTogglePerm(userId, resource, field, current) {
    updatePortalPermission(userId, resource, { [field]: !current })
      .then(function(updated) {
        setUsers(function(prev) {
          return prev.map(function(u) {
            if (u.id !== userId) return u
            return Object.assign({}, u, {
              portal_permissions: u.portal_permissions.map(function(p) {
                return p.resource === resource ? Object.assign({}, p, { [field]: !current }) : p
              }),
            })
          })
        })
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function copyPortalLink() {
    navigator.clipboard.writeText(PORTAL_URL)
    showMsg('URL del portal copiada')
  }

  var INP = { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div>
      {toast && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, background: toast.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(34,197,94,0.1)', color: toast.type === 'error' ? '#e63946' : '#22c55e', border: '1px solid ' + (toast.type === 'error' ? 'rgba(230,57,70,0.25)' : 'rgba(34,197,94,0.25)') }}>
          {toast.msg}
        </div>
      )}

      {/* URL del portal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '16px' }}>
        <ExternalLink style={{ width: '14px', height: '14px', color: 'var(--brand)', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PORTAL_URL}</span>
        <button type="button" onClick={copyPortalLink}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', flexShrink: 0 }}
        >
          <Copy style={{ width: '12px', height: '12px' }} />
          Copiar
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Usuarios con acceso ({users.length})
        </span>
        <button type="button" onClick={function() { setShowForm(function(v) { return !v }) }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus style={{ width: '13px', height: '13px' }} />
          Añadir usuario
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '12px' }}
          >
            <div style={{ padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--brand-border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={name} onChange={function(e) { setName(e.target.value) }} placeholder="Nombre del contacto" style={INP} />
              <input value={email} onChange={function(e) { setEmail(e.target.value) }} placeholder="Email del cliente" type="email" style={INP} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={function() { setShowForm(false) }}
                  style={{ flex: 1, padding: '7px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >Cancelar</button>
                <button type="button" onClick={handleAdd} disabled={adding || !email.trim()}
                  style={{ flex: 2, padding: '7px', borderRadius: '7px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}
                >{adding ? 'Creando...' : 'Crear acceso'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de usuarios */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Mail} title="Sin usuarios" description="Añade un email para dar acceso al portal a tu cliente." size="sm" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map(function(user) {
            var perms = user.portal_permissions || []
            return (
              <div key={user.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{user.name || 'Sin nombre'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{user.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={function() { handleInvite(user) }} disabled={sending[user.id]}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: 'var(--brand)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {sending[user.id] ? <Spinner size={12} /> : <Mail style={{ width: '12px', height: '12px' }} />}
                      Invitar
                    </button>
                    <button type="button" onClick={function() { handleDelete(user.id) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px' }}
                    ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
                  </div>
                </div>

                {/* Permisos */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['projects', 'messages', 'files'].map(function(res) {
                    var perm = perms.find(function(p) { return p.resource === res }) || {}
                    var labels = { projects: 'Proyectos', messages: 'Mensajes', files: 'Archivos' }
                    return (
                      <button key={res} type="button"
                        onClick={function() { handleTogglePerm(user.id, res, 'can_view', perm.can_view) }}
                        style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', background: perm.can_view ? 'rgba(34,197,94,0.12)' : 'var(--bg-4)', color: perm.can_view ? '#22c55e' : 'var(--text-5)', transition: 'all 0.1s' }}
                      >
                        {perm.can_view ? '–œ“ ' : '–œ— '}{labels[res]}
                      </button>
                    )
                  })}
                </div>

                {user.last_login && (
                  <p style={{ fontSize: '10px', color: 'var(--text-5)', marginTop: '8px' }}>
                    Àšltimo acceso: {fmtDate(user.last_login)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* –”€–”€ Sección: Mensajería –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function MessagesSection({ clientId }) {
  var [messages, setMessages] = useState([])
  var [loading,  setLoading]  = useState(true)
  var [input,    setInput]    = useState('')
  var [sending,  setSending]  = useState(false)
  var endRef = useRef(null)

  useEffect(function() {
    setLoading(true)
    getPortalMessages(clientId)
      .then(function(data) { setMessages(data); markMessagesAsRead(clientId) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [clientId])

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    var text = input.trim()
    if (!text || sending) return
    setSending(true)
    sendOwnerMessage(clientId, text)
      .then(function(msg) { setMessages(function(prev) { return prev.concat([msg]) }); setInput('') })
      .catch(function(e) { console.error(e) })
      .finally(function() { setSending(false) })
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'min(400px, 50vh)' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0 12px' }}>
        {messages.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Sin mensajes" description="Inicia la conversacion con tu cliente." size="sm" />
        ) : (
          messages.map(function(msg) {
            var isOwner = msg.sender_type === 'owner'
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: isOwner ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: isOwner ? 'var(--gradient-brand)' : 'var(--bg-3)',
                  border: isOwner ? 'none' : '1px solid var(--border)',
                  color: isOwner ? '#fff' : 'var(--text-1)',
                  fontSize: '13px', lineHeight: 1.6,
                }}>
                  <p>{msg.content}</p>
                  <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: isOwner ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    {!isOwner && !msg.read && <span style={{ marginLeft: '6px', color: 'var(--brand)' }}>–— nuevo</span>}
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
          value={input}
          onChange={function(e) { setInput(e.target.value) }}
          onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
        />
        <button type="button" onClick={handleSend} disabled={!input.trim() || sending}
          style={{ width: '36px', height: '36px', borderRadius: '8px', background: input.trim() && !sending ? 'var(--gradient-brand)' : 'var(--bg-4)', border: 'none', color: input.trim() && !sending ? '#fff' : 'var(--text-5)', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}
        >
          <Send style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
    </div>
  )
}

/* –”€–”€ Sección: Archivos –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function FilesSection({ clientId }) {
  var [files,    setFiles]    = useState([])
  var [loading,  setLoading]  = useState(true)
  var [uploading, setUploading] = useState(false)
  var [toast,    setToast]    = useState(null)
  var fileRef = useRef(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    setLoading(true)
    getPortalFiles(clientId)
      .then(function(data) { setFiles(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [clientId])

  function handleUpload(e) {
    var file = e.target.files && e.target.files[0]
    if (!file) return
    setUploading(true)
    uploadPortalFile(file, clientId, '')
      .then(function(f) { setFiles(function(prev) { return [f].concat(prev) }); showMsg('Archivo subido') })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setUploading(false); e.target.value = '' })
  }

  function handleDelete(id, path) {
    if (!window.confirm('Eliminar este archivo?')) return
    deletePortalFile(id, path)
      .then(function() { setFiles(function(prev) { return prev.filter(function(f) { return f.id !== id }) }); showMsg('Archivo eliminado') })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  return (
    <div>
      {toast && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, background: toast.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(34,197,94,0.1)', color: toast.type === 'error' ? '#e63946' : '#22c55e', border: '1px solid ' + (toast.type === 'error' ? 'rgba(230,57,70,0.25)' : 'rgba(34,197,94,0.25)') }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Archivos compartidos ({files.length})
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <input ref={fileRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
          {uploading ? <Spinner size={12} /> : <Upload style={{ width: '13px', height: '13px' }} />}
          {uploading ? 'Subiendo...' : 'Subir archivo'}
        </label>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>
      ) : files.length === 0 ? (
        <EmptyState icon={FileText} title="Sin archivos" description="Sube archivos para compartir con tu cliente." size="sm" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map(function(f) {
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{fileIcon(f.file_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{fmtSize(f.file_size)} · {fmtDate(f.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <a href={f.file_url} target="_blank" rel="noreferrer"
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-4)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-3)', textDecoration: 'none' }}
                  ><Download style={{ width: '13px', height: '13px' }} /></a>
                  <button type="button" onClick={function() { handleDelete(f.id, f.file_path) }}
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px' }}
                  ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* –”€–”€ Sección: Aprobaciones –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function ApprovalsSection({ clientId }) {
  var [approvals, setApprovals] = useState([])
  var [loading,   setLoading]   = useState(true)
  var [showForm,  setShowForm]  = useState(false)
  var [form,      setForm]      = useState({ title: '', description: '', due_date: '' })
  var [saving,    setSaving]    = useState(false)
  var [toast,     setToast]     = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    setLoading(true)
    getPortalApprovals(clientId)
      .then(function(data) { setApprovals(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [clientId])

  function handleCreate() {
    if (!form.title.trim()) return
    setSaving(true)
    createPortalApproval(clientId, form)
      .then(function(a) {
        setApprovals(function(prev) { return [a].concat(prev) })
        setForm({ title: '', description: '', due_date: '' })
        setShowForm(false)
        showMsg('Aprobacion creada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setSaving(false) })
  }

  function handleDelete(id) {
    if (!window.confirm('Eliminar esta aprobacion?')) return
    deletePortalApproval(id)
      .then(function() {
        setApprovals(function(prev) { return prev.filter(function(a) { return a.id !== id }) })
        showMsg('Aprobacion eliminada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  var INP = { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div>
      {toast && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, background: toast.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(34,197,94,0.1)', color: toast.type === 'error' ? '#e63946' : '#22c55e', border: '1px solid ' + (toast.type === 'error' ? 'rgba(230,57,70,0.25)' : 'rgba(34,197,94,0.25)') }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Aprobaciones ({approvals.length})
        </span>
        <button type="button" onClick={function() { setShowForm(function(v) { return !v }) }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus style={{ width: '13px', height: '13px' }} />
          Nueva
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--brand-border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={form.title} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { title: e.target.value }) }) }} placeholder="Titulo de la aprobacion" style={INP} />
              <textarea value={form.description} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { description: e.target.value }) }) }} placeholder="Descripcion (opcional)" rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} />
              <input type="date" value={form.due_date} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { due_date: e.target.value }) }) }} style={INP} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={function() { setShowForm(false) }}
                  style={{ flex: 1, padding: '7px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >Cancelar</button>
                <button type="button" onClick={handleCreate} disabled={saving || !form.title.trim()}
                  style={{ flex: 2, padding: '7px', borderRadius: '7px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >{saving ? 'Creando...' : 'Crear aprobacion'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>
      ) : approvals.length === 0 ? (
        <EmptyState icon={Check} title="Sin aprobaciones" description="Crea solicitudes de aprobacion para que tu cliente las revise." size="sm" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {approvals.map(function(a) {
            var sc = STATUS_CFG[a.status] || STATUS_CFG.pending
            return (
              <div key={a.id} style={{ padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{a.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <button type="button" onClick={function() { handleDelete(a.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.4)', display: 'flex', alignItems: 'center' }}
                    ><Trash2 style={{ width: '12px', height: '12px' }} /></button>
                  </div>
                </div>
                {a.description && <p style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '6px', lineHeight: 1.5 }}>{a.description}</p>}
                {a.feedback && (
                  <div style={{ padding: '8px 10px', background: 'var(--bg-4)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Feedback: </span>{a.feedback}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {a.due_date && <span style={{ fontSize: '10px', color: 'var(--text-5)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '10px', height: '10px' }} />{fmtDate(a.due_date)}</span>}
                  {a.projects && <span style={{ fontSize: '10px', color: 'var(--text-5)' }}>Proyecto: {a.projects.name}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   COMPONENTE PRINCIPAL
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
// Vista previa del portal tal como lo ve el cliente (solo lectura, dentro del owner).
function PreviewSection({ client }) {
  var [data,     setData]     = useState(null)
  var [branding, setBranding] = useState({ company_name: null, logo_url: null, brand_color: '#e63946' })
  var [loading,  setLoading]  = useState(true)
  var [error,    setError]    = useState('')

  useEffect(function() {
    var alive = true
    async function load() {
      setLoading(true); setError('')
      try {
        var res = await supabase.auth.getUser()
        var ownerId = res.data && res.data.user && res.data.user.id
        if (!ownerId) throw new Error('No autenticado')
        var results = await Promise.all([
          getPortalClientData(client.id, ownerId),
          getPortalBranding(ownerId),
        ])
        if (!alive) return
        setData(Object.assign({}, results[0], { ownerId: ownerId }))
        setBranding(results[1])
      } catch (e) {
        if (alive) setError(e.message || 'Error cargando la vista previa')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return function() { alive = false }
  }, [client.id])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando vista previa│</div>
  if (error)   return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--brand)' }}>{error}</div>

  return (
    <div style={{ height: '640px', maxHeight: '75vh', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <PortalView data={data} branding={branding} mode="preview" />
    </div>
  )
}

export default function PortalTab({ client }) {
  var [activeSection, setActiveSection] = useState('users')

  var SECTIONS = [
    { id: 'preview',   label: 'Vista previa', icon: Eye },
    { id: 'users',     label: 'Accesos',      icon: Mail },
    { id: 'messages',  label: 'Mensajes',     icon: MessageSquare },
    { id: 'files',     label: 'Archivos',     icon: FileText },
    { id: 'approvals', label: 'Aprobaciones', icon: Check },
  ]

  return (
    <div>
      {/* Header del portal */}
      <div style={{ padding: '14px 16px', background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>A</div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>Portal de Cliente –” {client.name}</p>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-4)', lineHeight: 1.5 }}>
          Espacio privado donde tu cliente puede ver el estado de sus proyectos, comunicarse contigo y aprobar entregas.
        </p>
      </div>

      {/* Navegacion de secciones */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-3)', padding: '4px', borderRadius: '10px' }}>
        {SECTIONS.map(function(s) {
          var Icon   = s.icon
          var active = activeSection === s.id
          return (
            <button key={s.id} type="button"
              onClick={function() { setActiveSection(s.id) }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 6px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: active ? 700 : 500, background: active ? 'var(--bg-1)' : 'transparent', color: active ? 'var(--text-1)' : 'var(--text-4)', transition: 'all 0.1s', boxShadow: active ? 'var(--shadow-card)' : 'none' }}
            >
              <Icon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Contenido de cada sección */}
      {activeSection === 'preview'   && <PreviewSection   client={client} />}
      {activeSection === 'users'     && <UsersSection     clientId={client.id} clientName={client.name} />}
      {activeSection === 'messages'  && <MessagesSection  clientId={client.id} />}
      {activeSection === 'files'     && <FilesSection     clientId={client.id} />}
      {activeSection === 'approvals' && <ApprovalsSection clientId={client.id} />}
    </div>
  )
}

