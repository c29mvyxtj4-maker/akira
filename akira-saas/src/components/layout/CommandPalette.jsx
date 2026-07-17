import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, FolderKanban, Receipt, FileSignature, BookOpen, X } from 'lucide-react'
import { searchAll } from '@/services/search.service'

var TYPE_ICON = { client: Users, project: FolderKanban, invoice: Receipt, quote: FileSignature, doc: BookOpen }
var TYPE_COLOR = { client: '#e63946', project: '#3b82f6', invoice: '#f59e0b', quote: '#a855f7', doc: '#22c55e' }

export default function CommandPalette({ open, onClose }) {
  var [query, setQuery] = useState('')
  var [results, setResults] = useState([])
  var [loading, setLoading] = useState(false)
  var [activeIndex, setActiveIndex] = useState(0)
  var inputRef = useRef(null)
  var navigate = useNavigate()

  useEffect(function() {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(function() { if (inputRef.current) inputRef.current.focus() }, 50)
    }
  }, [open])

  useEffect(function() {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    var t = setTimeout(function() {
      searchAll(query)
        .then(function(data) { setResults(data); setActiveIndex(0) })
        .finally(function() { setLoading(false) })
    }, 250)
    return function() { clearTimeout(t) }
  }, [query])

  // ← NUEVO: viaja con el id del resultado, para que la pagina de destino sepa abrir esa ficha en concreto
  function go(result) {
    navigate(result.path + '?open=' + result.id)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(function(i) { return Math.min(i + 1, results.length - 1) }); return }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(function(i) { return Math.max(i - 1, 0) }); return }
    if (e.key === 'Enter' && results[activeIndex]) { go(results[activeIndex]) }
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 16px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={function(e) { e.stopPropagation() }}
        style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search style={{ width: '16px', height: '16px', color: 'var(--text-4)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={function(e) { setQuery(e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes, proyectos, facturas, presupuestos, documentos..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '14px', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-5)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Buscando...</div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Sin resultados para "{query}"</div>
          )}

          {!loading && !query.trim() && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-5)', fontSize: '12px' }}>
              Escribe para buscar en toda tu cuenta
            </div>
          )}

          {results.map(function(r, i) {
            var Icon = TYPE_ICON[r.type] || Search
            var color = TYPE_COLOR[r.type] || 'var(--brand)'
            var active = i === activeIndex
            return (
              <button key={r.type + '-' + r.id} type="button"
                onClick={function() { go(r) }}
                onMouseEnter={function() { setActiveIndex(i) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 10px',
                  borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(230,57,70,0.1)' : 'transparent',
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '13px', height: '13px', color: color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{r.sublabel}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '14px', fontSize: '10px', color: 'var(--text-5)' }}>
          <span>↑↓ Navegar</span>
          <span>↵ Abrir</span>
          <span>Esc Cerrar</span>
        </div>
      </motion.div>
    </div>
  )
}