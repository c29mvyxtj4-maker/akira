import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Send, Loader2 } from 'lucide-react'
import { sendMessageStream } from '@/services/brain.service'
import DOMPurify from 'dompurify'

function renderSimpleMarkdown(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map(function(line) {
      var safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:700">$1</strong>')
      if (safe.trim() === '') return '<br>'
      if (safe.startsWith('- ')) return '<div style="display:flex;gap:6px;margin:2px 0"><span>•</span><span>' + safe.slice(2) + '</span></div>'
      return '<p style="margin:2px 0;">' + safe + '</p>'
    })
    .join('')
}

/**
 * Boton flotante contextual de Akira Brain.
 * contextLabel: texto corto que se muestra en la cabecera (ej: "Genaro Alfonsin")
 * contextText:  bloque de texto con los datos reales de lo que se esta viendo,
 *               que se le añade a la pregunta para que Akira responda con contexto real
 */
export default function AskAkiraButton({ contextLabel, contextText, controlledOpen, onOpenChange, hideFab }) {
  var [internalOpen, setInternalOpen] = useState(false)
  var isControlled = typeof controlledOpen === 'boolean'
  var open = isControlled ? controlledOpen : internalOpen
  function setOpen(v) {
    var next = typeof v === 'function' ? v(open) : v
    if (isControlled) { if (onOpenChange) onOpenChange(next) }
    else setInternalOpen(next)
  }
  var [input, setInput] = useState('')
  var [messages, setMessages] = useState([]) // conversacion efimera, solo en esta pantalla
  var [streaming, setStreaming] = useState(false)
  var [streamText, setStreamText] = useState('')
  var endRef = useRef(null)

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  function handleAsk() {
    var question = input.trim()
    if (!question || streaming) return

    var userMsg = { role: 'user', content: question }
    setMessages(function(prev) { return prev.concat([userMsg]) })
    setInput('')
    setStreaming(true)
    setStreamText('')

    var promptWithContext = 'Contexto de lo que estoy viendo ahora mismo:\n' + contextText + '\n\nMi pregunta: ' + question

    sendMessageStream(null, promptWithContext, [], function(chunk, full) {
      setStreamText(full)
    })
      .then(function(fullText) {
        setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: fullText }]) })
        setStreamText('')
      })
      .catch(function(e) {
        setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: 'Error: ' + e.message }]) })
        setStreamText('')
      })
      .finally(function() { setStreaming(false) })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() }
  }

  return (
    <>
      {/* Boton flotante */}
      {!open && !hideFab && (
        <motion.button
          type="button"
          onClick={function() { setOpen(true) }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '999px',
            background: 'var(--gradient-brand)', border: 'none', color: '#fff',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(230,57,70,0.4)',
          }}
        >
          <Zap style={{ width: '15px', height: '15px' }} />
          Pregúntale a Akira
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
              width: '360px', maxWidth: 'calc(100vw - 32px)', height: '460px', maxHeight: 'calc(100vh - 100px)',
              background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(230,57,70,0.05)' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap style={{ width: '13px', height: '13px', color: '#fff' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Akira Brain</p>
                <p style={{ fontSize: '10px', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contextLabel}</p>
              </div>
              <button type="button" onClick={function() { setOpen(false) }} style={{ background: 'none', border: 'none', color: 'var(--text-5)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 && !streaming && (
                <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-5)', fontSize: '12px' }}>
                  Puedo ver los datos de esto que estás mirando ahora mismo. Pregúntame algo — por ejemplo, "¿qué le sugerirías a este cliente?".
                </div>
              )}

              {messages.map(function(m, i) {
                var isUser = m.role === 'user'
                return (
                  <div key={i} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                    {isUser ? (
                      <div style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '10px', padding: '8px 11px', fontSize: '12px', color: '#f1f5f9' }}>{m.content}</div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderSimpleMarkdown(m.content)) }} />
                    )}
                  </div>
                )
              })}

              {streaming && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
                  {streamText ? (
                    <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderSimpleMarkdown(streamText)) }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-4)', fontSize: '12px' }}>
                      <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Pensando...
                    </div>
                  )}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <textarea
                value={input}
                onChange={function(e) { setInput(e.target.value) }}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta algo sobre esto..."
                rows={1}
                disabled={streaming}
                style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px', padding: '8px 10px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
              />
              <button type="button" onClick={handleAsk} disabled={!input.trim() || streaming}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: input.trim() && !streaming ? 'var(--gradient-brand)' : 'var(--bg-4)', color: input.trim() && !streaming ? '#fff' : 'var(--text-5)', cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{'@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }'}</style>
    </>
  )
}