import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, FolderKanban, Receipt, FileSignature, BookOpen, X, CornerDownLeft } from 'lucide-react'
import { searchAll, getRecent, getDocPreview } from '@db/queries/search.service'

var TYPE_ICON = { client: Users, project: FolderKanban, invoice: Receipt, quote: FileSignature, doc: BookOpen }
var TYPE_COLOR = { client: '#e63946', project: '#3b82f6', invoice: '#f59e0b', quote: '#a855f7', doc: '#22c55e' }
var TYPE_LABEL = { client: 'Cliente', project: 'Proyecto', invoice: 'Factura', quote: 'Presupuesto', doc: 'Documento' }

export default function CommandPalette({ open, onClose }) {
  var [query, setQuery] = useState('')
  var [results, setResults] = useState([])
  var [recent, setRecent] = useState([])
  var [loading, setLoading] = useState(false)
  var [activeIndex, setActiveIndex] = useState(0)
  var [preview, setPreview] = useState(null)   // { title, excerpt } para documentos
  var [isWide, setIsWide] = useState(false)
  var inputRef = useRef(null)
  var navigate = useNavigate()

  useEffect(function() {
    var mq = window.matchMedia('(min-width: 760px)')
    function apply() { setIsWide(mq.matches) }
    apply(); mq.addEventListener('change', apply)
    return function() { mq.removeEventListener('change', apply) }
  }, [])

  useEffect(function() {
    if (open) {
      setQuery(''); setResults([]); setActiveIndex(0); setPreview(null)
      getRecent().then(setRecent).catch(function() {})
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

  var items = query.trim() ? results : recent
  var activeItem = items[activeIndex] || null

  // Vista previa: para documentos, carga un extracto de su contenido.
  useEffect(function() {
    setPreview(null)
    if (!activeItem || activeItem.type !== 'doc') return
    var id = activeItem.id
    getDocPreview(id).then(function(p) { setPreview(function(cur) { return p ? { id: id, data: p } : cur }) }).catch(function() {})
  }, [activeItem && activeItem.type, activeItem && activeItem.id])

  function go(result) {
    navigate(result.path + '?open=' + result.id)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(function(i) { return Math.min(i + 1, items.length - 1) }); return }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(function(i) { return Math.max(i - 1, 0) }); return }
    if (e.key === 'Enter' && items[activeIndex]) { go(items[activeIndex]) }
  }

  function renderRow(r, i) {
    var Icon = TYPE_ICON[r.type] || Search
    var color = TYPE_COLOR[r.type] || 'var(--brand)'
    var active = i === activeIndex
    return (
      <button key={r.type + '-' + r.id} type="button"
        onClick={function() { go(r) }}
        onMouseEnter={function() { setActiveIndex(i) }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', background: active ? 'var(--brand-dim)' : 'transparent' }}
      >
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon style={{ width: '13px', height: '13px', color: color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{r.sublabel}</p>
        </div>
      </button>
    )
  }

  function Preview() {
    if (!activeItem) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-5)', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
        Selecciona un resultado para ver su vista previa
      </div>
    )
    var Icon = TYPE_ICON[activeItem.type] || Search
    var color = TYPE_COLOR[activeItem.type] || 'var(--brand)'
    var docPrev = preview && preview.id === activeItem.id ? preview.data : null
    return (
      <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <Icon style={{ width: '22px', height: '22px', color: color }} />
        </div>
        <p style={{ fontSize: '10px', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{TYPE_LABEL[activeItem.type] || 'Elemento'}</p>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{activeItem.label}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: '4px' }}>{activeItem.sublabel}</p>

        {activeItem.type === 'doc' && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {docPrev ? (docPrev.excerpt || 'Documento vacÃ­o.') : 'Cargando vista previaâ€¦'}
          </div>
        )}

        <button type="button" onClick={function() { go(activeItem) }}
          style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'var(--gradient-brand)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          Abrir <CornerDownLeft style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '72px 16px 16px' }}
          onClick={onClose}
        >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24, mass: 0.9 } }}
        exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.13, ease: [0.4, 0, 1, 1] } }}
        onClick={function(e) { e.stopPropagation() }}
        style={{ width: '100%', maxWidth: isWide ? '880px' : '560px', transformOrigin: 'top center', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 110px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search style={{ width: '16px', height: '16px', color: 'var(--text-4)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={function(e) { setQuery(e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes, proyectos, facturas, documentos..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '14px', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-5)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', minHeight: 0, flex: 1 }}>
          {/* Lista */}
          <div style={{ width: isWide ? '420px' : '100%', flexShrink: 0, overflowY: 'auto', padding: '8px', borderRight: isWide ? '1px solid var(--border)' : 'none' }}>
            {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Buscando...</div>}
            {!loading && query.trim() && results.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Sin resultados para "{query}"</div>
            )}
            {!query.trim() && recent.length > 0 && (
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-5)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px 4px' }}>Reciente</p>
            )}
            {items.map(renderRow)}
            {!query.trim() && recent.length === 0 && !loading && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-5)', fontSize: '12px' }}>Escribe para buscar en toda tu cuenta</div>
            )}
          </div>

          {/* Vista previa (solo escritorio) */}
          {isWide && (
            <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-base)' }}>
              <Preview />
            </div>
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '14px', fontSize: '10px', color: 'var(--text-5)' }}>
          <span>â†‘â†“ Navegar</span>
          <span>â†µ Abrir</span>
          <span>Esc Cerrar</span>
        </div>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

