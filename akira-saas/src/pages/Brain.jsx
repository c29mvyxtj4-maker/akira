import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Send, Trash2, Edit2,
  Brain as BrainIcon,
  Copy, Check, RefreshCw,
  Zap, User, ChevronLeft, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import {
  getConversations, createConversation, archiveConversation,
  updateConversationTitle, getMessages, saveMessage,
  sendMessageStream,
} from '@/services/brain.service'
import { executeAction, summarizeAction, ACTION_LABELS } from '@/services/brainActions.service'
import DOMPurify from 'dompurify'

var ACTION_START = '[AKIRA_ACTION]'
var ACTION_END   = '[/AKIRA_ACTION]'

function extractAction(content) {
  if (!content) return null
  var startIdx = content.indexOf(ACTION_START)
  var endIdx   = content.indexOf(ACTION_END)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null

  var before = content.slice(0, startIdx).trim()
  var after  = content.slice(endIdx + ACTION_END.length).trim()
  var raw    = content.slice(startIdx + ACTION_START.length, endIdx).trim()

  try {
    var parsed = JSON.parse(raw)
    return { before: before, after: after, type: parsed.type, data: parsed.data || {} }
  } catch (e) {
    return null
  }
}

function renderMarkdown(text) {
  if (!text) return ''
  var lines   = text.split('\n')
  var html    = []
  var inCode  = false
  var codeBuf = []
  var inList  = false

  lines.forEach(function(line) {
    if (line.startsWith('```')) {
      if (inCode) {
        html.push('<pre style="background:#0a0a0d;border:1px solid rgba(230,57,70,0.15);border-radius:8px;padding:12px;overflow-x:auto;margin:8px 0;"><code style="color:#ff8585;font-size:12px;font-family:monospace;">' + codeBuf.join('\n') + '</code></pre>')
        codeBuf = []
        inCode  = false
      } else {
        inCode = true
      }
      return
    }
    if (inCode) { codeBuf.push(line.replace(/</g,'&lt;').replace(/>/g,'&gt;')); return }

    if (line.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<h3 style="font-size:15px;font-weight:700;color:#ffffff;margin:16px 0 6px">' + fmt(line.slice(4)) + '</h3>')
    } else if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:20px 0 8px">' + fmt(line.slice(3)) + '</h2>')
    } else if (line.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<h1 style="font-size:22px;font-weight:900;color:#ffffff;margin:24px 0 10px">' + fmt(line.slice(2)) + '</h1>')
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html.push('<ul style="padding-left:20px;margin:8px 0;">'); inList = true }
      html.push('<li style="color:#a0a0b0;margin:3px 0;">' + fmt(line.slice(2)) + '</li>')
    } else if (line === '---') {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<hr style="border:none;border-top:1px solid rgba(230,57,70,0.2);margin:16px 0">')
    } else if (line.trim() === '') {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<br>')
    } else {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<p style="color:#a0a0b0;margin:4px 0;line-height:1.7;">' + fmt(line) + '</p>')
    }
  })

  if (inList) html.push('</ul>')
  return html.join('')
}

function fmt(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff;font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="color:#e0e0e8">$1</em>')
    .replace(/`(.+?)`/g,       '<code style="background:rgba(230,57,70,0.1);color:#e63946;padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
}

/* ── Tarjeta de confirmacion de accion ────────────────────── */
function ActionCard({ type, data, onConfirmed }) {
  var [status, setStatus] = useState('pending') // pending | saving | done | error
  var [errorMsg, setErrorMsg] = useState('')
  var rows = summarizeAction(type, data)

  function handleConfirm() {
    setStatus('saving')
    executeAction(type, data)
      .then(function(result) {
        setStatus('done')
        if (onConfirmed) onConfirmed(type, result)
      })
      .catch(function(e) {
        setStatus('error')
        setErrorMsg(e.message)
      })
  }

  function handleCancel() {
    setStatus('cancelled')
  }

  if (status === 'cancelled') {
    return (
      <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '8px 20px' }}>
        Accion cancelada.
      </div>
    )
  }

  return (
    <div style={{ margin: '8px 20px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Zap style={{ width: '14px', height: '14px', color: '#e63946' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#e63946' }}>{ACTION_LABELS[type] || 'Accion propuesta'}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        {rows.map(function(row, i) {
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{row[0]}</span>
              <span style={{ fontSize: '12px', color: '#f1f5f9', textAlign: 'right' }}>{row[1]}</span>
            </div>
          )
        })}
      </div>

      {status === 'pending' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={handleCancel}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >Cancelar</button>
          <button type="button" onClick={handleConfirm}
            style={{ flex: 2, padding: '8px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >Confirmar y guardar</button>
        </div>
      )}

      {status === 'saving' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Guardando...
        </div>
      )}

      {status === 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>
          <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Guardado correctamente
        </div>
      )}

      {status === 'error' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>
            <XCircle style={{ width: '14px', height: '14px' }} /> Error: {errorMsg}
          </div>
          <button type="button" onClick={handleConfirm}
            style={{ width: '100%', padding: '7px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >Reintentar</button>
        </div>
      )}
    </div>
  )
}

function Message({ msg, isStreaming, onActionConfirmed }) {
  var [copied, setCopied] = useState(false)
  var isUser = msg.role === 'user'
  var action = !isUser ? extractAction(msg.content) : null

  function copyText() {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', gap: '12px', padding: '16px 20px',
        background: isUser ? 'rgba(230,57,70,0.04)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'rgba(230,57,70,0.15)' : 'rgba(230,57,70,0.1)',
        border: '1px solid rgba(230,57,70,0.25)',
      }}>
        {isUser
          ? <User style={{ width: '15px', height: '15px', color: '#e63946' }} />
          : <Zap style={{ width: '15px', height: '15px', color: '#e63946' }} />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e63946' }}>
            {isUser ? 'Tu' : 'Akira Brain'}
          </span>
          {!isStreaming && (
            <button type="button" onClick={copyText}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#e63946' : 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
            >
              {copied
                ? <><Check style={{ width: '11px', height: '11px' }} /> Copiado</>
                : <><Copy style={{ width: '11px', height: '11px' }} /> Copiar</>
              }
            </button>
          )}
        </div>

        {isUser ? (
          <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        ) : action ? (
          <div>
            {action.before && (
              <div style={{ fontSize: '14px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(action.before)) }} />
            )}
          </div>
        ) : (
          <div
            style={{ fontSize: '14px', lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(msg.content)) + (isStreaming ? '<span style="display:inline-block;width:2px;height:14px;background:#e63946;margin-left:2px;animation:blink 1s infinite;vertical-align:middle"></span>' : '') }}
          />
        )}
      </div>

      {action && (
        <div style={{ position: 'absolute' }} />
      )}
    </motion.div>
  )
}

function ConversationList({ conversations, activeId, onSelect, onCreate, onArchive, onRename }) {
  var [renamingId, setRenamingId] = useState(null)
  var [renameVal,  setRenameVal]  = useState('')
  var inputRef = useRef(null)

  useEffect(function() {
    if (renamingId && inputRef.current) { inputRef.current.focus(); inputRef.current.select() }
  }, [renamingId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" onClick={onCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}
        >
          <Plus style={{ width: '15px', height: '15px' }} />
          Nueva conversacion
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
            Sin conversaciones
          </div>
        ) : (
          conversations.map(function(conv) {
            var isActive   = activeId === conv.id
            var isRenaming = renamingId === conv.id
            return (
              <div key={conv.id}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', marginBottom: '2px', background: isActive ? 'rgba(230,57,70,0.1)' : 'transparent', border: '1px solid ' + (isActive ? 'rgba(230,57,70,0.2)' : 'transparent'), cursor: 'pointer', transition: 'all 0.1s' }}
                onClick={function() { if (!isRenaming) onSelect(conv.id) }}
                onMouseEnter={function(e) { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={function(e) { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <BrainIcon style={{ width: '13px', height: '13px', color: isActive ? '#e63946' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />

                {isRenaming ? (
                  <input ref={inputRef} value={renameVal}
                    onChange={function(e) { setRenameVal(e.target.value) }}
                    onBlur={function() { onRename(conv.id, renameVal); setRenamingId(null) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') { onRename(conv.id, renameVal); setRenamingId(null) } if (e.key === 'Escape') setRenamingId(null) }}
                    onClick={function(e) { e.stopPropagation() }}
                    style={{ flex: 1, background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#f1f5f9', borderRadius: '4px', fontSize: '12px', padding: '2px 6px', outline: 'none', fontFamily: 'inherit' }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '12px', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.title}
                  </span>
                )}

                {isActive && !isRenaming && (
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={function(e) { e.stopPropagation() }}>
                    <button type="button" onClick={function() { setRenameVal(conv.title); setRenamingId(conv.id) }}
                      style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}
                    ><Edit2 style={{ width: '11px', height: '11px' }} /></button>
                    <button type="button" onClick={function() { onArchive(conv.id) }}
                      style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '4px' }}
                    ><Trash2 style={{ width: '11px', height: '11px' }} /></button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

var SUGGESTIONS = [
  { text: 'Analiza el estado actual de mi negocio' },
  { text: 'Que clientes tienen mas potencial de crecimiento?' },
  { text: 'Como puedo mejorar mi rentabilidad este mes?' },
  { text: 'Resume mis proyectos activos y su estado' },
  { text: 'Que riesgos detectas en mi negocio ahora mismo?' },
  { text: 'Dame 3 acciones concretas para crecer este trimestre' },
  { text: 'Redacta un email de seguimiento para un cliente inactivo' },
  { text: 'Como puedo optimizar mi MRR con las suscripciones actuales?' },
]

export default function Brain() {
  var [conversations,    setConversations]    = useState([])
  var [activeConvId,     setActiveConvId]     = useState(null)
  var [messages,         setMessages]         = useState([])
  var [streamingContent, setStreamingContent] = useState('')
  var [isStreaming,      setIsStreaming]       = useState(false)
  var [input,            setInput]            = useState('')
  var [loading,          setLoading]          = useState(false)
  var [convLoading,      setConvLoading]      = useState(true)
  var [toastMsg,         setToastMsg]         = useState(null)
  var messagesEndRef = useRef(null)
  var textareaRef    = useRef(null)

  var [mobileStep, setMobileStep] = useState('list')
  var [isMobile, setIsMobile] = useState(false)
  useEffect(function() {
    var mq = window.matchMedia('(max-width: 768px)')
    function update() { setIsMobile(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return function() { mq.removeEventListener('change', update) }
  }, [])

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  function scrollToBottom() {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(function() { scrollToBottom() }, [messages, streamingContent])

  useEffect(function() {
    setConvLoading(true)
    getConversations()
      .then(function(data) { setConversations(data) })
      .catch(function(e) { console.error('[Brain]', e) })
      .finally(function() { setConvLoading(false) })
  }, [])

  useEffect(function() {
    if (!activeConvId) { setMessages([]); return }
    getMessages(activeConvId)
      .then(function(data) { setMessages(data) })
      .catch(function(e) { console.error('[Brain] messages:', e) })
  }, [activeConvId])

  function handleSelectConv(id) {
    setActiveConvId(id)
    setMobileStep('chat')
  }

  function handleNewConversation() {
    createConversation('Nueva conversacion')
      .then(function(conv) {
        setConversations(function(prev) { return [conv].concat(prev) })
        setActiveConvId(conv.id)
        setMessages([])
        setMobileStep('chat')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleArchive(id) {
    if (!window.confirm('Eliminar esta conversacion?')) return
    archiveConversation(id)
      .then(function() {
        setConversations(function(prev) { return prev.filter(function(c) { return c.id !== id }) })
        if (activeConvId === id) { setActiveConvId(null); setMessages([]); setMobileStep('list') }
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleRename(id, title) {
    if (!title || !title.trim()) return
    updateConversationTitle(id, title.trim())
      .then(function(updated) {
        setConversations(function(prev) { return prev.map(function(c) { return c.id === updated.id ? updated : c }) })
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  // Cuando se confirma una accion desde una tarjeta, añadimos un mensaje de confirmacion al historial
  function handleActionConfirmed(type, result) {
    var confirmMsg = { id: 'tmp_conf_' + Date.now(), conversation_id: activeConvId, role: 'assistant', content: '✅ Listo, lo he guardado correctamente.', created_at: new Date().toISOString() }
    setMessages(function(prev) { return prev.concat([confirmMsg]) })
    if (activeConvId) saveMessage(activeConvId, 'assistant', confirmMsg.content).catch(function() {})
  }

  var handleSend = useCallback(function() {
    var text = input.trim()
    if (!text || isStreaming) return
    if (!activeConvId) { showToast('Crea o selecciona una conversacion primero', 'error'); return }

    var userMsg = { id: 'tmp_' + Date.now(), conversation_id: activeConvId, role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(function(prev) { return prev.concat([userMsg]) })
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')
    setLoading(true)

    var isFirst = messages.length === 0
    var conv = conversations.find(function(c) { return c.id === activeConvId })
    if (isFirst && conv && conv.title === 'Nueva conversacion') {
      handleRename(activeConvId, text.slice(0, 40) + (text.length > 40 ? '...' : ''))
    }

    saveMessage(activeConvId, 'user', text).catch(function() {})

    sendMessageStream(activeConvId, text, messages, function(chunk, fullText) {
      setStreamingContent(fullText)
    })
      .then(function(fullText) {
        var assistantMsg = { id: 'tmp_a_' + Date.now(), conversation_id: activeConvId, role: 'assistant', content: fullText, created_at: new Date().toISOString() }
        setMessages(function(prev) { return prev.concat([assistantMsg]) })
        setStreamingContent('')
        return saveMessage(activeConvId, 'assistant', fullText)
      })
      .catch(function(e) {
        var errMsg = { id: 'tmp_err_' + Date.now(), conversation_id: activeConvId, role: 'assistant', content: 'Error: ' + e.message, created_at: new Date().toISOString() }
        setMessages(function(prev) { return prev.concat([errMsg]) })
        setStreamingContent('')
      })
      .finally(function() { setIsStreaming(false); setLoading(false) })
  }, [input, isStreaming, activeConvId, messages, conversations])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleSuggestion(text) {
    if (!activeConvId) {
      createConversation('Nueva conversacion')
        .then(function(conv) {
          setConversations(function(prev) { return [conv].concat(prev) })
          setActiveConvId(conv.id)
          setMessages([])
          setInput(text)
          setMobileStep('chat')
          setTimeout(function() { if (textareaRef.current) textareaRef.current.focus() }, 100)
        })
        .catch(function(e) { showToast(e.message, 'error') })
    } else {
      setInput(text)
      if (textareaRef.current) textareaRef.current.focus()
    }
  }

  var showWelcome = !activeConvId || messages.length === 0
  var showListPane = !isMobile || mobileStep === 'list'
  var showChatPane = !isMobile || mobileStep === 'chat'

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {showListPane && (
        <div style={{ width: isMobile ? '100%' : '240px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,8,0.6)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(230,57,70,0.4)' }}>
              <Zap style={{ width: '14px', height: '14px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>Akira Brain</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {convLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Cargando...</div>
            ) : (
              <ConversationList
                conversations={conversations}
                activeId={activeConvId}
                onSelect={handleSelectConv}
                onCreate={handleNewConversation}
                onArchive={handleArchive}
                onRename={handleRename}
              />
            )}
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e63946', boxShadow: '0 0 6px rgba(230,57,70,0.6)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Gemini 2.0 Flash</span>
          </div>
        </div>
      )}

      {showChatPane && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {(activeConvId || isMobile) && (
            <div style={{ flexShrink: 0, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {isMobile && (
                  <button type="button" onClick={function() { setMobileStep('list') }}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', flexShrink: 0 }}
                  ><ChevronLeft style={{ width: '18px', height: '18px' }} /></button>
                )}
                {activeConvId && (
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(conversations.find(function(c) { return c.id === activeConvId }) || {}).title || 'Conversacion'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{messages.length} mensajes</p>
                  </div>
                )}
              </div>
              <button type="button" onClick={handleNewConversation}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                {!isMobile && 'Nueva'}
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {showWelcome && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 32px rgba(230,57,70,0.4)' }}>
                  <Zap style={{ width: '32px', height: '32px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.02em' }}>Akira Brain</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
                  Tu asistente de IA con acceso a los datos reales de tu negocio. Ahora tambien puede crear cosas por ti — siempre con tu confirmacion.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px', width: '100%', maxWidth: '600px' }}>
                  {SUGGESTIONS.map(function(s, i) {
                    return (
                      <motion.button key={i} type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={function() { handleSuggestion(s.text) }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(230,57,70,0.1)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.25)' }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'rgba(230,57,70,0.04)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.1)' }}
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e63946', flexShrink: 0, marginTop: '6px' }} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{s.text}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {!showWelcome && messages.map(function(msg, i) {
              var action = msg.role === 'assistant' ? extractAction(msg.content) : null
              return (
                <div key={msg.id || i}>
                  <Message msg={msg} isStreaming={false} />
                  {action && (
                    <ActionCard type={action.type} data={action.data} onConfirmed={handleActionConfirmed} />
                  )}
                </div>
              )
            })}

            {isStreaming && streamingContent && (
              <Message msg={{ role: 'assistant', content: streamingContent }} isStreaming={true} />
            )}

            {isStreaming && !streamingContent && (
              <div style={{ display: 'flex', gap: '12px', padding: '16px 20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap style={{ width: '15px', height: '15px', color: '#e63946' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '8px' }}>
                  {[0,1,2].map(function(i) {
                    return <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e63946', animation: 'bounce 1.2s infinite', animationDelay: (i * 0.2) + 's' }} />
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={{ flexShrink: 0, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,6,8,0.6)' }}>
            {!activeConvId && (
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button type="button" onClick={handleNewConversation}
                  style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}
                >Crear nueva conversacion para empezar</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: '12px', padding: '10px 14px', transition: 'border-color 0.15s' }}
              onFocusCapture={function(e) { e.currentTarget.style.borderColor = 'rgba(230,57,70,0.35)' }}
              onBlurCapture={function(e) { e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)' }}
            >
              <textarea ref={textareaRef} value={input}
                onChange={function(e) {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder={activeConvId ? 'Pregunta algo, o pidele que cree algo por ti...' : 'Crea una conversacion para empezar...'}
                disabled={!activeConvId || isStreaming}
                rows={1}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '14px', lineHeight: 1.6, resize: 'none', fontFamily: 'inherit', maxHeight: '150px', overflow: 'auto', opacity: (!activeConvId || isStreaming) ? 0.5 : 1 }}
              />
              <button type="button" onClick={handleSend}
                disabled={!input.trim() || !activeConvId || isStreaming}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: input.trim() && activeConvId && !isStreaming ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.06)', color: input.trim() && activeConvId && !isStreaming ? '#fff' : 'rgba(255,255,255,0.25)', cursor: input.trim() && activeConvId && !isStreaming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', boxShadow: input.trim() && activeConvId && !isStreaming ? '0 4px 12px rgba(230,57,70,0.3)' : 'none' }}
              >
                {isStreaming
                  ? <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  : <Send style={{ width: '16px', height: '16px' }} />
                }
              </button>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '8px' }}>
              Akira Brain tiene acceso a tus datos reales y puede proponer acciones — siempre las confirmas tu antes de guardarlas
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(230,57,70,0.9)' }}
          >{toastMsg.msg}</motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}