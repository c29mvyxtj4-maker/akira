import { useEditor, EditorContent } from '@tiptap/react'
import { Node, mergeAttributes }    from '@tiptap/core'
import { StarterKit }               from '@tiptap/starter-kit'
import { Placeholder }              from '@tiptap/extension-placeholder'
import { Underline }                from '@tiptap/extension-underline'
import { TextAlign }                from '@tiptap/extension-text-align'
import { TextStyle }                from '@tiptap/extension-text-style'
import { Color }                    from '@tiptap/extension-color'
import { Highlight }                from '@tiptap/extension-highlight'
import { TaskList }                 from '@tiptap/extension-task-list'
import { TaskItem }                 from '@tiptap/extension-task-item'
import { Link }                     from '@tiptap/extension-link'
import { Image }                    from '@tiptap/extension-image'
import { Table }                    from '@tiptap/extension-table'
import { TableRow }                 from '@tiptap/extension-table-row'
import { TableHeader }              from '@tiptap/extension-table-header'
import { TableCell }                from '@tiptap/extension-table-cell'
import { CharacterCount }           from '@tiptap/extension-character-count'
import { Youtube }                  from '@tiptap/extension-youtube'
import { useEffect, useRef, useState } from 'react'
import { uploadFile } from '@/services/kb.service'
import { getPref } from '@/shared/hooks/usePreferences'
import { SlashCommand } from './SlashCommand'

/* –”€–”€ Limpieza de JSON para evitar referencias circulares –”€–”€–”€–”€ */
function cleanJSON(node) {
  if (node === null || node === undefined) return node
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') return node
  if (Array.isArray(node)) return node.map(cleanJSON)
  if (typeof node !== 'object') return null
  var allowed = ['type', 'text', 'content', 'marks', 'attrs']
  var clean = {}
  Object.keys(node).forEach(function(key) {
    if (allowed.indexOf(key) === -1) return
    var val = node[key]
    if (val === null || val === undefined) return
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      clean[key] = val
    } else if (Array.isArray(val)) {
      clean[key] = val.map(cleanJSON)
    } else if (typeof val === 'object') {
      clean[key] = cleanJSON(val)
    }
  })
  return clean
}

/* –”€–”€ Callout extension –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
var CALLOUT_CFG = {
  info:    { label: 'i',  bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  color: '#3b82f6' },
  warning: { label: '!',  bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  color: '#f59e0b' },
  danger:  { label: '!!', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   color: '#ef4444' },
  success: { label: 'ok', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   color: '#22c55e' },
  tip:     { label: '*',  bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)',  color: '#a855f7' },
}

var CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  addAttributes: function() {
    return {
      type: {
        default: 'info',
        parseHTML: function(el) { return el.getAttribute('data-type') },
        renderHTML: function(attrs) { return { 'data-type': attrs.type } },
      },
    }
  },
  parseHTML: function() { return [{ tag: 'div[data-callout]' }] },
  renderHTML: function(p) {
    return ['div', mergeAttributes(p.HTMLAttributes, { 'data-callout': '', 'data-type': p.node.attrs.type }), 0]
  },
  addNodeView: function() {
    return function(p) {
      var node    = p.node
      var wrap    = document.createElement('div')
      var badge   = document.createElement('span')
      var content = document.createElement('div')
      badge.style.cssText   = 'font-size:11px;font-weight:700;flex-shrink:0;margin-top:3px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;'
      content.style.cssText = 'flex:1;min-width:0;'
      wrap.appendChild(badge)
      wrap.appendChild(content)
      function apply() {
        var c = CALLOUT_CFG[node.attrs.type] || CALLOUT_CFG.info
        wrap.setAttribute('data-callout', '')
        wrap.setAttribute('data-type', node.attrs.type)
        wrap.style.cssText = 'display:flex;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid ' + c.border + ';background:' + c.bg + ';margin:10px 0;'
        badge.textContent  = c.label
        badge.style.color  = c.color
        badge.style.border = '1px solid ' + c.border
        badge.style.background = c.bg
      }
      apply()
      return {
        dom: wrap,
        contentDOM: content,
        update: function(u) {
          if (u.type.name !== 'callout') return false
          node = u
          apply()
          return true
        },
      }
    }
  },
  addCommands: function() {
    return {
      insertCallout: function(attrs) {
        return function(p) {
          return p.commands.insertContent({ type: 'callout', attrs: attrs, content: [{ type: 'paragraph' }] })
        }
      },
    }
  },
})

/* –”€–”€ ToolBtn –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={function(e) { e.preventDefault(); onClick() }}
      title={title}
      style={{
        minWidth: '28px', height: '28px', padding: '0 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', border: 'none', cursor: 'pointer',
        background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
        color: active ? '#818cf8' : 'rgba(255,255,255,0.55)',
        transition: 'all 0.1s', fontSize: '12px', fontWeight: 600,
      }}
      onMouseEnter={function(e) { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
      onMouseLeave={function(e) { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.07)', margin: '0 2px', flexShrink: 0 }} />
}

/* –”€–”€ BlockSelect –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function BlockSelect({ editor }) {
  if (!editor) return null
  var opts = [
    { label: 'Parrafo',  fn: function() { editor.chain().focus().setParagraph().run() },                        isActive: editor.isActive('paragraph') && !editor.isActive('heading') },
    { label: 'H1',       fn: function() { editor.chain().focus().toggleHeading({ level: 1 }).run() },           isActive: editor.isActive('heading', { level: 1 }) },
    { label: 'H2',       fn: function() { editor.chain().focus().toggleHeading({ level: 2 }).run() },           isActive: editor.isActive('heading', { level: 2 }) },
    { label: 'H3',       fn: function() { editor.chain().focus().toggleHeading({ level: 3 }).run() },           isActive: editor.isActive('heading', { level: 3 }) },
    { label: 'H4',       fn: function() { editor.chain().focus().toggleHeading({ level: 4 }).run() },           isActive: editor.isActive('heading', { level: 4 }) },
    { label: 'Cita',     fn: function() { editor.chain().focus().toggleBlockquote().run() },                    isActive: editor.isActive('blockquote') },
    { label: 'Codigo',   fn: function() { editor.chain().focus().toggleCodeBlock().run() },                     isActive: editor.isActive('codeBlock') },
    { label: 'Lista',    fn: function() { editor.chain().focus().toggleBulletList().run() },                    isActive: editor.isActive('bulletList') },
    { label: 'Numerada', fn: function() { editor.chain().focus().toggleOrderedList().run() },                   isActive: editor.isActive('orderedList') },
    { label: 'Tareas',   fn: function() { editor.chain().focus().toggleTaskList().run() },                      isActive: editor.isActive('taskList') },
  ]
  var cur = opts.find(function(o) { return o.isActive }) || opts[0]
  return (
    <select
      value={cur.label}
      onChange={function(e) {
        var o = opts.find(function(x) { return x.label === e.target.value })
        if (o) o.fn()
      }}
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', borderRadius: '6px', fontSize: '12px', padding: '4px 8px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      {opts.map(function(o) { return <option key={o.label} value={o.label}>{o.label}</option> })}
    </select>
  )
}

/* –”€–”€ CalloutMenu –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function CalloutMenu({ editor, onClose }) {
  var types = [
    { type: 'info',    label: 'Info' },
    { type: 'warning', label: 'Aviso' },
    { type: 'danger',  label: 'Peligro' },
    { type: 'success', label: 'Exito' },
    { type: 'tip',     label: 'Consejo' },
  ]
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', marginTop: '4px', minWidth: '140px' }}>
      {types.map(function(t) {
        var c = CALLOUT_CFG[t.type]
        return (
          <button
            key={t.type}
            type="button"
            onClick={function() { editor.chain().focus().insertCallout({ type: t.type }).run(); onClose() }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '7px 10px', borderRadius: '7px', border: 'none', background: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '13px', textAlign: 'left' }}
            onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'none' }}
          >
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.bg, border: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: c.color, flexShrink: 0 }}>
              {c.label}
            </span>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* –”€–”€ TableMenu –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function TableMenu({ editor, onClose }) {
  function Btn(label, fn, danger) {
    return (
      <button
        key={label}
        type="button"
        onClick={function() { fn(); onClose() }}
        style={{ display: 'block', width: '100%', padding: '7px 10px', borderRadius: '7px', border: 'none', background: 'none', cursor: 'pointer', color: danger ? '#ef4444' : '#cbd5e1', fontSize: '13px', textAlign: 'left' }}
        onMouseEnter={function(e) { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)' }}
        onMouseLeave={function(e) { e.currentTarget.style.background = 'none' }}
      >
        {label}
      </button>
    )
  }
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', marginTop: '4px', minWidth: '170px' }}>
      {Btn('Insertar tabla 3x3', function() { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() })}
      {editor.isActive('table') && Btn('+ Columna', function() { editor.chain().focus().addColumnAfter().run() })}
      {editor.isActive('table') && Btn('+ Fila',    function() { editor.chain().focus().addRowAfter().run() })}
      {editor.isActive('table') && Btn('Eliminar tabla', function() { editor.chain().focus().deleteTable().run() }, true)}
    </div>
  )
}

/* –”€–”€ Toolbar –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function Toolbar({ editor, docId }) {
  var [showCallout, setShowCallout] = useState(false)
  var [showTable,   setShowTable]   = useState(false)
  var fileRef = useRef(null)

  if (!editor) return null

  function insertLink() {
    var url = window.prompt('URL del enlace:')
    if (!url) return
    if (!url.startsWith('http')) url = 'https://' + url
    editor.chain().focus().setLink({ href: url }).run()
  }

  function insertYoutube() {
    var url = window.prompt('URL de YouTube:')
    if (!url) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  function handleImg(e) {
    var file = e.target.files && e.target.files[0]
    if (!file || !docId) return
    uploadFile(file, docId)
      .then(function(up) { editor.chain().focus().setImage({ src: up.url, alt: file.name }).run() })
      .catch(function(err) { window.alert('Error al subir imagen: ' + err.message) })
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flexWrap: 'wrap', padding: '5px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,18,0.9)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
      <BlockSelect editor={editor} />
      <Sep />
      <ToolBtn active={editor.isActive('bold')}      onClick={function() { editor.chain().focus().toggleBold().run() }}      title="Negrita"><b>B</b></ToolBtn>
      <ToolBtn active={editor.isActive('italic')}    onClick={function() { editor.chain().focus().toggleItalic().run() }}    title="Cursiva"><i>I</i></ToolBtn>
      <ToolBtn active={editor.isActive('underline')} onClick={function() { editor.chain().focus().toggleUnderline().run() }} title="Subrayado"><u>U</u></ToolBtn>
      <ToolBtn active={editor.isActive('strike')}    onClick={function() { editor.chain().focus().toggleStrike().run() }}    title="Tachado"><s>S</s></ToolBtn>
      <ToolBtn active={editor.isActive('highlight')} onClick={function() { editor.chain().focus().toggleHighlight().run() }} title="Resaltado">
        <span style={{ background: 'rgba(251,191,36,0.3)', padding: '0 2px', borderRadius: '2px' }}>H</span>
      </ToolBtn>
      <ToolBtn active={editor.isActive('code')} onClick={function() { editor.chain().focus().toggleCode().run() }} title="Codigo">
        <span style={{ fontFamily: 'monospace' }}>{`<>`}</span>
      </ToolBtn>
      <Sep />
      <label
        title="Color"
        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '6px', position: 'relative' }}
        onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: editor.getAttributes('textStyle').color || '#f1f5f9', borderBottom: '2px solid currentColor' }}>A</span>
        <input type="color" onChange={function(e) { editor.chain().focus().setColor(e.target.value).run() }} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} />
      </label>
      <Sep />
      <ToolBtn active={editor.isActive({ textAlign: 'left' })}   onClick={function() { editor.chain().focus().setTextAlign('left').run() }}   title="Izquierda">–‰¡</ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={function() { editor.chain().focus().setTextAlign('center').run() }} title="Centro">–‰¡</ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'right' })}  onClick={function() { editor.chain().focus().setTextAlign('right').run() }}  title="Derecha">–‰¡</ToolBtn>
      <Sep />
      <ToolBtn active={editor.isActive('bulletList')}  onClick={function() { editor.chain().focus().toggleBulletList().run() }}  title="Lista">–¢ –‰¡</ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={function() { editor.chain().focus().toggleOrderedList().run() }} title="Numerada">1.–‰¡</ToolBtn>
      <ToolBtn active={editor.isActive('taskList')}    onClick={function() { editor.chain().focus().toggleTaskList().run() }}    title="Tareas">–˜‘–‰¡</ToolBtn>
      <ToolBtn active={editor.isActive('blockquote')}  onClick={function() { editor.chain().focus().toggleBlockquote().run() }}  title="Cita">"</ToolBtn>
      <ToolBtn active={editor.isActive('codeBlock')}   onClick={function() { editor.chain().focus().toggleCodeBlock().run() }}   title="Bloque">
        <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{'{ }'}</span>
      </ToolBtn>
      <Sep />
      <ToolBtn active={editor.isActive('link')} onClick={insertLink} title="Enlace">ðŸ”—</ToolBtn>
      <label
        title="Imagen"
        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '6px' }}
        onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent' }}
      >
        <span>ðŸ–¼</span>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
      </label>
      <div style={{ position: 'relative' }}>
        <ToolBtn active={editor.isActive('table')} onClick={function() { setShowTable(function(v) { return !v }); setShowCallout(false) }} title="Tabla">–Šž</ToolBtn>
        {showTable && <TableMenu editor={editor} onClose={function() { setShowTable(false) }} />}
      </div>
      <ToolBtn active={false} onClick={insertYoutube} title="Video">––¶</ToolBtn>
      <ToolBtn active={false} onClick={function() { editor.chain().focus().setHorizontalRule().run() }} title="Divisor">–”</ToolBtn>
      <div style={{ position: 'relative' }}>
        <ToolBtn active={editor.isActive('callout')} onClick={function() { setShowCallout(function(v) { return !v }); setShowTable(false) }} title="Callout">ðŸ’¡</ToolBtn>
        {showCallout && <CalloutMenu editor={editor} onClose={function() { setShowCallout(false) }} />}
      </div>
      <div style={{ flex: 1 }} />
      <ToolBtn active={false} onClick={function() { editor.chain().focus().undo().run() }} title="Deshacer">–†©</ToolBtn>
      <ToolBtn active={false} onClick={function() { editor.chain().focus().redo().run() }} title="Rehacer">–†ª</ToolBtn>
    </div>
  )
}

/* –”€–”€ AttachmentsPanel –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
function AttachmentsPanel({ attachments, onAdd, onDelete }) {
  var fileRef     = useRef(null)
  var [uploading, setUploading] = useState(false)

  function handleChange(e) {
    var file = e.target.files && e.target.files[0]
    if (!file) return
    setUploading(true)
    onAdd(file)
      .catch(function(err) { window.alert('Error: ' + err.message) })
      .finally(function() { setUploading(false); e.target.value = '' })
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

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 48px 40px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Adjuntos ({attachments.length})
        </span>
        <label style={{ cursor: 'pointer' }}>
          <input ref={fileRef} type="file" onChange={handleChange} style={{ display: 'none' }} />
          <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
            {uploading ? 'Subiendo...' : '+ Adjuntar'}
          </span>
        </label>
      </div>
      {attachments.length === 0 ? (
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <input type="file" onChange={handleChange} style={{ display: 'none' }} />
          <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
            Arrastra archivos o haz clic para subir
          </div>
        </label>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {attachments.map(function(att) {
            return (
              <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{fileIcon(att.file_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '13px', color: '#a5b4fc', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                  >
                    {att.name}
                  </a>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{fmtSize(att.file_size)}</span>
                </div>
                <button
                  type="button"
                  onClick={function () { onDelete(att.id, att.file_path) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', fontSize: '18px', lineHeight: 1 }}
                >x</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* –•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•
   EDITOR PRINCIPAL
–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–•–• */
export default function TipTapEditor({ doc, onChange, attachments, onAttachFile, onDeleteAttachment, showAttachments }) {
  var docIdRef    = useRef(null)
  var onChangeRef = useRef(onChange)

  useEffect(function() { onChangeRef.current = onChange }, [onChange])

  var editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1,2,3,4,5,6] } }),
      Placeholder.configure({ placeholder: "Escribe '/' para insertar bloques│" }),
      SlashCommand,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ controls: true, nocookie: true }),
      CharacterCount,
      CalloutNode,
    ],
    content: { type: 'doc', content: [] },
    onUpdate: function(params) {
      var id = docIdRef.current
      if (!id) return
      try {
        var raw  = params.editor.getJSON()
        var safe = cleanJSON(raw)
        if (safe && onChangeRef.current) {
          onChangeRef.current(id, safe)
        }
      } catch (e) {
        console.error('[TipTap] onUpdate error:', e.message)
      }
    },
    editorProps: {
      // Corrector ortográfico segÀºn la preferencia (idioma o desactivado).
      attributes: (function () {
        var sc = getPref('pref_spellcheck', 'es')
        var attrs = { class: 'kb-editor-content', spellcheck: sc === 'off' ? 'false' : 'true' }
        if (sc && sc !== 'off') attrs.lang = sc.split(',')[0]
        return attrs
      })(),
    },
  })

  /* Sincronizar cuando cambia el documento activo */
  useEffect(function() {
    if (!editor) return
    if (!doc || !doc.id) {
      docIdRef.current = null
      return
    }
    docIdRef.current = doc.id
    var incoming = (doc.content && doc.content.type === 'doc') ? doc.content : { type: 'doc', content: [] }
    try {
      var currentStr  = JSON.stringify(editor.getJSON())
      var incomingStr = JSON.stringify(incoming)
      if (currentStr !== incomingStr) {
        editor.commands.setContent(incoming, false)
      }
    } catch (e) {
      editor.commands.setContent(incoming, false)
    }
  }, [editor, doc ? doc.id : null])

  /* Paste de imagenes */
  useEffect(function() {
    if (!editor) return
    function onPaste(e) {
      var items = e.clipboardData && e.clipboardData.items
      if (!items) return
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if (item.type && item.type.startsWith('image/')) {
          e.preventDefault()
          var file = item.getAsFile()
          if (!file || !docIdRef.current) continue
          ;(function(f, id) {
            uploadFile(f, id)
              .then(function(up) { editor.chain().focus().setImage({ src: up.url }).run() })
              .catch(function(err) { console.error('[TipTap] paste:', err) })
          })(file, docIdRef.current)
        }
      }
    }
    var el = editor.view.dom
    el.addEventListener('paste', onPaste)
    return function() { el.removeEventListener('paste', onPaste) }
  }, [editor])

  /* Drag & drop de imagenes */
  useEffect(function() {
    if (!editor) return
    function onDrop(e) {
      var files = e.dataTransfer && e.dataTransfer.files
      if (!files || !files.length) return
      var file = files[0]
      if (!file.type || !file.type.startsWith('image/')) return
      e.preventDefault()
      if (!docIdRef.current) return
      ;(function(f, id) {
        uploadFile(f, id)
          .then(function(up) { editor.chain().focus().setImage({ src: up.url, alt: f.name }).run() })
          .catch(function(err) { console.error('[TipTap] drop:', err) })
      })(file, docIdRef.current)
    }
    var el = editor.view.dom
    el.addEventListener('drop', onDrop)
    return function() { el.removeEventListener('drop', onDrop) }
  }, [editor])

  var words = 0
  var chars = 0
  try {
    if (editor && editor.storage && editor.storage.characterCount) {
      words = editor.storage.characterCount.words()
      chars = editor.storage.characterCount.characters()
    }
  } catch (e) {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Toolbar editor={editor} docId={doc ? doc.id : null} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <EditorContent editor={editor} style={{ minHeight: '100%' }} />
        {showAttachments && (
          <AttachmentsPanel
            attachments={attachments || []}
            onAdd={onAttachFile}
            onDelete={onDeleteAttachment}
          />
        )}
      </div>
      <div style={{ flexShrink: 0, padding: '4px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{words} palabras</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{chars} caracteres</span>
        {doc && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>v{doc.version || 1}</span>}
      </div>
    </div>
  )
}
