import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, ChevronLeft, ChevronRight,
  Save, Tag, BookOpen, History, Star, X, Folder,
} from 'lucide-react'
import { useKnowledge }   from '@/hooks/useKnowledge'
import FolderTree         from '@/components/knowledge/FolderTree'
import DocList            from '@/components/knowledge/DocList'
import TipTapEditor       from '@/components/knowledge/TipTapEditor'
import { useSearchParams } from 'react-router-dom'
import { KNOWLEDGE_TEMPLATES } from '@/data/knowledgeTemplates'

var STATUS_OPTIONS = [
  { value: 'all',       label: 'Todos' },
  { value: 'draft',     label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'private',   label: 'Privado' },
]

var STATUS_COLORS = {
  draft:     '#64748b',
  published: '#22c55e',
  archived:  '#f59e0b',
  private:   '#a855f7',
}

var INP = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9',
  borderRadius: '7px',
  fontSize: '12px',
  padding: '6px 10px',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
}

/* ── Panel de propiedades ─────────────────────────────────── */
function DocMetaPanel({ doc, onMetaChange, onClose }) {
  var [tagInput, setTagInput] = useState('')
  if (!doc) return null
  var tags = Array.isArray(doc.tags) ? doc.tags : []

  function addTag() {
    var t = tagInput.trim().toLowerCase()
    if (!t || tags.includes(t)) { setTagInput(''); return }
    onMetaChange(doc.id, { tags: tags.concat([t]) })
    setTagInput('')
  }

  function removeTag(t) {
    onMetaChange(doc.id, { tags: tags.filter(function(x) { return x !== t }) })
  }

  return (
    <motion.div
      className="knowledge-side-panel"
      initial={{ x: 280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 280, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ width: '260px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ED2121' }}>Propiedades</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <div>
          <p style={{ fontSize: '10px', color: 'rgba(237,33,33,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Icono</p>
          <input value={doc.icon || '📄'} onChange={function(e) { onMetaChange(doc.id, { icon: e.target.value }) }} style={Object.assign({}, INP, { fontSize: '20px', textAlign: 'center' })} maxLength={2} />
        </div>

        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Estado</p>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['draft','published','private','archived'].map(function(s) {
              var active = doc.status === s
              var labels = { draft: 'Borrador', published: 'Publicado', private: 'Privado', archived: 'Archivado' }
              return (
                <button key={s} type="button" onClick={function() { onMetaChange(doc.id, { status: s }) }}
                  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: active ? (STATUS_COLORS[s] + '25') : 'rgba(255,255,255,0.04)', color: active ? STATUS_COLORS[s] : 'rgba(255,255,255,0.4)', transition: 'all 0.1s' }}
                >{labels[s]}</button>
              )
            })}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Categoria</p>
          <input value={doc.category || ''} onChange={function(e) { onMetaChange(doc.id, { category: e.target.value }) }} placeholder="Ej: Procedimientos" style={INP} />
        </div>

        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Etiquetas</p>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {tags.map(function(t) {
              return (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '20px', fontSize: '11px', background: 'rgba(230,57,70,0.15)', color: '#e63946', border: '1px solid rgba(230,57,70,0.25)' }}>
                  {t}
                  <button type="button" onClick={function() { removeTag(t) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e63946', fontSize: '13px', lineHeight: 1, padding: 0 }}>x</button>
                </span>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input value={tagInput} onChange={function(e) { setTagInput(e.target.value) }}
              onKeyDown={function(e) {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
                if (e.key === 'Backspace' && !tagInput && tags.length > 0) { onMetaChange(doc.id, { tags: tags.slice(0, -1) }) }
              }}
              placeholder="Anadir etiqueta..."
              style={INP}
            />
            <button type="button" onClick={addTag} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>+</button>
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Estadisticas</p>
          {[
            ['Palabras',  doc.word_count    || 0],
            ['Tiempo',    (doc.read_time_min || 1) + ' min'],
            ['Version',   'v' + (doc.version || 1)],
            ['Favorito',  doc.is_favorited ? 'Si' : 'No'],
          ].map(function(row) {
            return (
              <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{row[0]}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9' }}>{row[1]}</span>
              </div>
            )
          })}
        </div>

        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Fechas</p>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Creado</span>
              <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-ES') : '--'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Modificado</span>
              <span>{doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('es-ES') : '--'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Marcar como plantilla</span>
          <button type="button" onClick={function() { onMetaChange(doc.id, { is_template: !doc.is_template }) }}
            style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', border: 'none', background: doc.is_template ? '#ED2121' : '#374151', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <span style={{ position: 'absolute', top: '2px', left: doc.is_template ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Panel historial ──────────────────────────────────────── */
function VersionsPanel({ versions, onClose }) {
  return (
    <motion.div
      className="knowledge-side-panel"
      initial={{ x: 280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 280, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ width: '240px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>Historial</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {versions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            <p>Sin versiones guardadas</p>
            <p style={{ marginTop: '4px', fontSize: '11px' }}>Usa "Guardar version" para crear un snapshot</p>
          </div>
        ) : (
          versions.map(function(v) {
            return (
              <div key={v.id} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: '6px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', marginBottom: '3px' }}>v{v.version} - {v.title}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(v.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{v.word_count} palabras</p>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

function TemplatePickerModal({ onPick, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={function(e) { e.stopPropagation() }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Elige una plantilla</h3>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button type="button" onClick={function() { onPick(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-3)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '18px' }}>📄</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>Documento en blanco</p>
              <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>Empezar desde cero</p>
            </div>
          </button>
          {KNOWLEDGE_TEMPLATES.map(function(t) {
            return (
              <button key={t.id} type="button" onClick={function() { onPick(t) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-3)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: '18px' }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{t.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════════════ */
export default function Knowledge() {
  var hook = useKnowledge()
  var [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  var [showMeta,         setShowMeta]         = useState(false)
  var [showVersions,     setShowVersions]     = useState(false)

  var [mobileStep, setMobileStep] = useState('docs') // 'folders' | 'docs' | 'editor'

  var [isMobile, setIsMobile] = useState(false)
  useEffect(function() {
    var mq = window.matchMedia('(max-width: 768px)')
    function update() { setIsMobile(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return function() { mq.removeEventListener('change', update) }
  }, [])

  // Abrir directamente un documento si venimos de la busqueda global — NUEVO
  var [searchParams] = useSearchParams()
  useEffect(function() {
    var openId = searchParams.get('open')
    if (openId) {
      hook.openDocument(openId)
      setMobileStep('editor')
    }
  }, [searchParams])

  var activeFolder = hook.folders.find(function(f) { return f.id === hook.selectedFolderId })

  function getFolderLabel() {
    if (hook.selectedFolderId === 'all')       return 'Todos los documentos'
    if (hook.selectedFolderId === 'favorites') return 'Favoritos'
    if (hook.selectedFolderId === 'templates') return 'Plantillas'
    return activeFolder ? activeFolder.name : 'Documentos'
  }

  function handleSelectFolderMobile(id) {
    hook.setSelectedFolderId(id)
    setMobileStep('docs')
  }

  function handleOpenDocMobile(doc) {
    hook.openDocument(doc)
    setMobileStep('editor')
  }

  // Crear documento: SIEMPRE se llama sin argumentos, para no pasarle
  // por error el propio clic del botón como si fuera el id de carpeta. ← CORREGIDO
  var [showTemplatePicker, setShowTemplatePicker] = useState(false)

  function handleNewDocMobile() {
    setShowTemplatePicker(true)
  }

  function handlePickTemplate(template) {
    setShowTemplatePicker(false)
    if (template) {
      hook.handleCreateDocFromTemplate(template.defaultTitle, template.content)
    } else {
      hook.handleCreateDoc()
    }
    setMobileStep('editor')
  }

  var showFoldersPane = !isMobile ? !sidebarCollapsed : mobileStep === 'folders'
  var showDocsPane    = !isMobile ? true : mobileStep === 'docs'
  var showEditorPane  = !isMobile ? true : mobileStep === 'editor'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* TOPBAR */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '52px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {isMobile && mobileStep === 'editor' && (
            <button type="button" onClick={function() { setMobileStep('docs') }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
            </button>
          )}
          <BookOpen style={{ width: '18px', height: '18px', color: '#e63946', flexShrink: 0 }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', flexShrink: 0 }}>Conocimiento</span>
          {hook.activeDoc && !isMobile && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>/</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{getFolderLabel()}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>/</span>
              <span style={{ fontSize: '13px', color: '#c7d2fe', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hook.activeDoc.title || 'Sin titulo'}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {hook.activeDoc && !isMobile && (
            <span style={{ fontSize: '11px', color: hook.saving ? '#e63946' : 'rgba(255,255,255,0.25)' }}>
              {hook.saving ? 'Guardando...' : hook.lastSaved ? 'Guardado ' + hook.lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}

          {hook.activeDoc && (
            <>
              {!isMobile && (
                <button type="button" onClick={hook.handleSaveVersion}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                ><Save style={{ width: '13px', height: '13px' }} /> Version</button>
              )}

              <button type="button" onClick={function() { setShowVersions(function(v) { return !v }); setShowMeta(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: showVersions ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: showVersions ? '#e63946' : '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              ><History style={{ width: '13px', height: '13px' }} /></button>

              <button type="button" onClick={function() { setShowMeta(function(v) { return !v }); setShowVersions(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: showMeta ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: showMeta ? '#e63946' : '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              ><Tag style={{ width: '13px', height: '13px' }} /></button>

              {!isMobile && (
                <button type="button" onClick={function() { hook.setShowAttachments(function(v) { return !v }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', background: hook.showAttachments ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: hook.showAttachments ? '#e63946' : '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >Adjuntos {hook.attachments.length > 0 ? '(' + hook.attachments.length + ')' : ''}</button>
              )}

              <button type="button" onClick={function() { hook.handleToggleFavorite(hook.activeDoc.id, hook.activeDoc.is_favorited) }}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: hook.activeDoc.is_favorited ? '#fbbf24' : '#94a3b8' }}
              ><Star style={{ width: '14px', height: '14px', fill: hook.activeDoc.is_favorited ? '#fbbf24' : 'none' }} /></button>
            </>
          )}

          <button type="button" onClick={handleNewDocMobile}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'var(--brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          ><Plus style={{ width: '14px', height: '14px' }} /> {!isMobile && 'Nuevo'}</button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Arbol de carpetas */}
        <AnimatePresence>
          {showFoldersPane && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? '100%' : 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, borderRight: '1px solid rgba(237,255,255,0.06)', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}
            >
              <div style={{ width: isMobile ? '100%' : '220px', height: '100%', overflow: 'hidden' }}>
                <FolderTree
                  folders={hook.folders}
                  docs={hook.docs}
                  selectedFolderId={hook.selectedFolderId}
                  expandedFolders={hook.expandedFolders}
                  renamingFolder={hook.renamingFolder}
                  onSelect={handleSelectFolderMobile}
                  onToggle={hook.toggleFolderExpanded}
                  onCreateRoot={function() { hook.handleCreateFolder(null) }}
                  onCreateSub={hook.handleCreateFolder}
                  onRename={hook.handleRenameFolder}
                  onArchive={hook.handleArchiveFolder}
                  onColorChange={hook.handleUpdateFolderColor}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boton colapsar — solo en escritorio */}
        {!isMobile && (
          <button type="button"
            onClick={function() { setSidebarCollapsed(function(v) { return !v }) }}
            style={{ width: '16px', flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}
          >
            {sidebarCollapsed
              ? <ChevronRight style={{ width: '10px', height: '10px' }} />
              : <ChevronLeft  style={{ width: '10px', height: '10px' }} />
            }
          </button>
        )}

        {/* Panel lista de documentos */}
        {showDocsPane && (
          <div style={{ width: isMobile ? '100%' : '240px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flexShrink: 0, padding: '10px 10px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                {isMobile && (
                  <button type="button" onClick={function() { setMobileStep('folders') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 8px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}
                  ><Folder style={{ width: '11px', height: '11px' }} /> Carpetas</button>
                )}

                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{getFolderLabel()}</span>
                <button type="button" onClick={handleNewDocMobile}
                  style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#e63946', flexShrink: 0 }}
                ><Plus style={{ width: '13px', height: '13px' }} /></button>
              </div>
              <div style={{ position: 'relative', marginBottom: '6px' }}>
                <Search style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input value={hook.search} onChange={function(e) { hook.setSearch(e.target.value) }}
                  placeholder="Buscar..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#f1f5f9', borderRadius: '7px', fontSize: '12px', padding: '5px 8px 5px 26px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <select value={hook.statusFilter} onChange={function(e) { hook.setStatusFilter(e.target.value) }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a4b8', borderRadius: '7px', fontSize: '11px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {STATUS_OPTIONS.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
              </select>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <DocList
                docs={hook.docs}
                loading={hook.docsLoading}
                activeDocId={hook.activeDoc ? hook.activeDoc.id : null}
                onOpen={handleOpenDocMobile}
                onArchive={hook.handleArchiveDoc}
                onFavorite={hook.handleToggleFavorite}
                onNew={handleNewDocMobile}
              />
            </div>
          </div>
        )}

        {/* Editor */}
        {showEditorPane && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {hook.docLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
                Cargando...
              </div>
            ) : hook.activeDoc ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flexShrink: 0, padding: isMobile ? '20px 20px 0' : '28px 48px 0', maxWidth: '860px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
                  <input
                    value={hook.activeDoc.title || ''}
                    onChange={function(e) { hook.handleTitleChange(hook.activeDoc.id, e.target.value) }}
                    placeholder="Titulo del documento"
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: isMobile ? '26px' : '32px', fontWeight: 900, color: '#f1f5f9', fontFamily: 'inherit', lineHeight: 1.2, letterSpacing: '-0.03em', boxSizing: 'border-box' }}
                  />
                  <input
                    value={hook.activeDoc.subtitle || ''}
                    onChange={function(e) { hook.handleMetaChange(hook.activeDoc.id, { subtitle: e.target.value }) }}
                    placeholder="Subtitulo opcional..."
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.35)', fontFamily: 'inherit', marginTop: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0 0' }} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <TipTapEditor
                    doc={hook.activeDoc}
                    onChange={hook.handleContentChange}
                    attachments={hook.attachments}
                    onAttachFile={hook.handleAttachFile}
                    onDeleteAttachment={hook.handleDeleteAttachment}
                    showAttachments={hook.showAttachments}
                  />
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.2)' }}>
                <BookOpen style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', marginBottom: '8px', color: 'rgba(255,255,255,0.3)' }}>Selecciona un documento</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.15)', marginBottom: '20px' }}>o crea uno nuevo</p>
                <button type="button" onClick={handleNewDocMobile}
                  style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >+ Nuevo documento</button>
              </div>
            )}

            <AnimatePresence>
              {showMeta && hook.activeDoc && (
                <DocMetaPanel
                  doc={hook.activeDoc}
                  onMetaChange={hook.handleMetaChange}
                  onClose={function() { setShowMeta(false) }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showVersions && (
                <VersionsPanel
                  versions={hook.versions}
                  onClose={function() { setShowVersions(false) }}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {hook.toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: hook.toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}
          >
            {hook.toastMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>
      {showTemplatePicker && (
        <TemplatePickerModal onPick={handlePickTemplate} onClose={function() { setShowTemplatePicker(false) }} />
      )}
    </div>
  )
}