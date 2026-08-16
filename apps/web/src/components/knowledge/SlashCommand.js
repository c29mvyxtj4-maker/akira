import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

/*
 * Comando "/" estilo Notion para el editor TipTap. Al teclear "/" aparece un
 * menú flotante en el cursor con bloques (encabezados, listas, tabla, cita,
 * código, divisor, callout…). Filtra según lo que escribas y se navega con las
 * flechas + Enter. Implementado con @tiptap/suggestion y un menú en DOM plano
 * (sin dependencias de posicionamiento extra).
 */

var ITEMS = [
  { title: 'Texto', desc: 'Párrafo normal', icon: '¶', keys: ['texto', 'parrafo', 'text', 'p'],
    command: function (e, r) { e.chain().focus().deleteRange(r).setParagraph().run() } },
  { title: 'Encabezado 1', desc: 'Título grande', icon: 'H1', keys: ['h1', 'encabezado', 'titulo', 'heading'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleHeading({ level: 1 }).run() } },
  { title: 'Encabezado 2', desc: 'Título mediano', icon: 'H2', keys: ['h2', 'encabezado', 'subtitulo', 'heading'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleHeading({ level: 2 }).run() } },
  { title: 'Encabezado 3', desc: 'Título pequeño', icon: 'H3', keys: ['h3', 'encabezado', 'heading'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleHeading({ level: 3 }).run() } },
  { title: 'Lista con viñetas', desc: 'Lista simple', icon: '•', keys: ['lista', 'vinetas', 'bullet', 'ul'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleBulletList().run() } },
  { title: 'Lista numerada', desc: 'Lista ordenada', icon: '1.', keys: ['numerada', 'ordenada', 'ol', 'numero'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleOrderedList().run() } },
  { title: 'Lista de tareas', desc: 'Casillas de verificación', icon: '☑', keys: ['tarea', 'todo', 'checkbox', 'tareas'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleTaskList().run() } },
  { title: 'Cita', desc: 'Bloque de cita', icon: '❝', keys: ['cita', 'quote', 'blockquote'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleBlockquote().run() } },
  { title: 'Código', desc: 'Bloque de código', icon: '</>', keys: ['codigo', 'code', 'pre'],
    command: function (e, r) { e.chain().focus().deleteRange(r).toggleCodeBlock().run() } },
  { title: 'Tabla', desc: 'Tabla 3×3', icon: '▦', keys: ['tabla', 'table'],
    command: function (e, r) { e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() } },
  { title: 'Divisor', desc: 'Línea separadora', icon: '—', keys: ['divisor', 'linea', 'hr', 'separador'],
    command: function (e, r) { e.chain().focus().deleteRange(r).setHorizontalRule().run() } },
  { title: 'Callout', desc: 'Bloque destacado', icon: '💡', keys: ['callout', 'destacado', 'aviso', 'nota'],
    command: function (e, r) { e.chain().focus().deleteRange(r).insertCallout({ type: 'info' }).run() } },
]

function filterItems(query) {
  var q = (query || '').toLowerCase().trim()
  if (!q) return ITEMS
  return ITEMS.filter(function (it) {
    if (it.title.toLowerCase().indexOf(q) !== -1) return true
    return it.keys.some(function (k) { return k.indexOf(q) !== -1 })
  })
}

function buildMenu() {
  var el = document.createElement('div')
  el.className = 'slash-menu'
  el.style.cssText = 'position:fixed;z-index:1000;min-width:230px;max-height:320px;overflow-y:auto;background:var(--bg-2,#16161f);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.5);padding:6px;'
  return el
}

function renderRows(el, items, selected, onPick) {
  el.innerHTML = ''
  if (!items.length) {
    var empty = document.createElement('div')
    empty.style.cssText = 'padding:10px 12px;font-size:12.5px;color:var(--text-4,#8b8b96);'
    empty.textContent = 'Sin resultados'
    el.appendChild(empty)
    return
  }
  items.forEach(function (it, i) {
    var row = document.createElement('button')
    row.type = 'button'
    row.style.cssText = 'display:flex;align-items:center;gap:11px;width:100%;padding:8px 10px;border:none;border-radius:8px;cursor:pointer;text-align:left;background:' + (i === selected ? 'var(--bg-3,rgba(255,255,255,0.06))' : 'transparent') + ';'
    var badge = document.createElement('span')
    badge.style.cssText = 'width:30px;height:30px;flex-shrink:0;border-radius:7px;background:var(--bg-3,rgba(255,255,255,0.05));border:1px solid var(--border,rgba(255,255,255,0.08));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text-2,#c7c7cf);'
    badge.textContent = it.icon
    var txt = document.createElement('div')
    txt.style.cssText = 'min-width:0;'
    var t = document.createElement('p')
    t.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-1,#f1f1f4);'
    t.textContent = it.title
    var d = document.createElement('p')
    d.style.cssText = 'font-size:11px;color:var(--text-4,#8b8b96);margin-top:1px;'
    d.textContent = it.desc
    txt.appendChild(t); txt.appendChild(d)
    row.appendChild(badge); row.appendChild(txt)
    row.addEventListener('mousedown', function (ev) { ev.preventDefault(); onPick(it) })
    el.appendChild(row)
  })
}

function positionMenu(el, rect) {
  if (!rect) return
  var margin = 6
  var menuH = el.offsetHeight || 300
  var below = rect.bottom + margin
  var top = (below + menuH > window.innerHeight) ? Math.max(8, rect.top - menuH - margin) : below
  el.style.top = top + 'px'
  el.style.left = Math.min(rect.left, window.innerWidth - (el.offsetWidth || 240) - 8) + 'px'
}

export var SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions: function () {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: function (props) {
          var editor = props.editor
          var range = props.range
          var item = props.props
          if (item && item.command) item.command(editor, range)
        },
      },
    }
  },
  addProseMirrorPlugins: function () {
    return [
      Suggestion(Object.assign({}, this.options.suggestion, {
        editor: this.editor,
        items: function (params) { return filterItems(params.query) },
        render: function () {
          var el = null
          var items = []
          var selected = 0
          var cmd = null
          var closed = false // ocultado con Escape hasta que termine el contexto "/"

          function pick(it) { if (cmd) cmd(it) }
          function teardown() { if (el && el.parentNode) el.parentNode.removeChild(el); el = null }

          return {
            onStart: function (props) {
              items = props.items
              selected = 0
              cmd = props.command
              closed = false
              el = buildMenu()
              renderRows(el, items, selected, pick)
              document.body.appendChild(el)
              positionMenu(el, props.clientRect && props.clientRect())
            },
            onUpdate: function (props) {
              items = props.items
              cmd = props.command
              if (closed) return
              if (!el) { el = buildMenu(); document.body.appendChild(el) }
              if (selected >= items.length) selected = 0
              renderRows(el, items, selected, pick)
              positionMenu(el, props.clientRect && props.clientRect())
            },
            onKeyDown: function (props) {
              var key = props.event.key
              if (key === 'Escape') { closed = true; teardown(); return true }
              if (closed || !items.length) return false
              if (key === 'ArrowDown') { selected = (selected + 1) % items.length; renderRows(el, items, selected, pick); return true }
              if (key === 'ArrowUp') { selected = (selected - 1 + items.length) % items.length; renderRows(el, items, selected, pick); return true }
              if (key === 'Enter') { pick(items[selected]); return true }
              return false
            },
            onExit: function () {
              teardown(); items = []; selected = 0; cmd = null; closed = false
            },
          }
        },
      })),
    ]
  },
})

export default SlashCommand
