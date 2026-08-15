import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Trash2, Copy, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

const BLOCK_TYPES = {
  paragraph: { label: 'Párrafo', icon: '¶' },
  heading_1: { label: 'Encabezado 1', icon: 'H1' },
  heading_2: { label: 'Encabezado 2', icon: 'H2' },
  heading_3: { label: 'Encabezado 3', icon: 'H3' },
  bulleted_list: { label: 'Lista de viñetas', icon: '•' },
  numbered_list: { label: 'Lista numerada', icon: '1.' },
  checklist: { label: 'Lista de verificación', icon: '☑' },
  toggle: { label: 'Toggle', icon: '▶' },
  quote: { label: 'Cita', icon: '❝' },
  divider: { label: 'Divisor', icon: '—' },
  code: { label: 'Código', icon: '<>' },
  callout: { label: 'Callout', icon: '💡' },
  columns: { label: 'Columnas', icon: '⫸' },
  image: { label: 'Imagen', icon: '🖼' },
}

export function BlockEditor({ block, onUpdate, onDelete, onShowMenu, isLast }) {
  const [content, setContent] = useState(block.content.text || '')
  const [showMenu, setShowMenu] = useState(false)
  const contentRef = useRef(null)
  const menuTimeoutRef = useRef(null)

  const handleChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdate({ ...block.content, text: newContent })
  }

  const handleKeyDown = (e) => {
    // Comando "/"
    if (e.key === '/' && content === '') {
      e.preventDefault()
      onShowMenu(block.id)
      return
    }

    // Enter en ciertos bloques
    if (e.key === 'Enter' && !e.shiftKey) {
      if (['heading_1', 'heading_2', 'heading_3', 'quote'].includes(block.type)) {
        e.preventDefault()
        // Crear nuevo párrafo debajo
        onShowMenu(block.id)
      }
    }

    // Tab para indentar
    if (e.key === 'Tab') {
      e.preventDefault()
      // Implementar indentación
    }
  }

  const handleInputFocus = () => {
    setShowMenu(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-2 py-1"
    >
      {/* Drag handle + menu */}
      <div className="flex gap-1 pt-2">
        <button
          onMouseEnter={() => {
            clearTimeout(menuTimeoutRef.current)
            setShowMenu(true)
          }}
          onMouseLeave={() => {
            menuTimeoutRef.current = setTimeout(() => setShowMenu(false), 200)
          }}
          className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-text-1 transition-opacity"
          title="Menú de bloque"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Menú flotante */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-0 top-full mt-1 bg-surface-1 border border-surface-2 rounded-lg shadow-lg z-50 flex gap-1 p-1"
        >
          <button
            onClick={() => {
              // Duplicar bloque
              setShowMenu(false)
            }}
            className="p-2 hover:bg-surface-2 rounded text-text-3 hover:text-text-1 transition-colors"
            title="Duplicar"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => {
              onDelete(block.id)
              setShowMenu(false)
            }}
            className="p-2 hover:bg-status-danger/10 rounded text-status-danger hover:text-status-danger transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </motion.div>
      )}

      {/* Editor de contenido */}
      <div className="flex-1 relative">
        {block.type === 'paragraph' && (
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder="Escribe '/' para comandos..."
            className="w-full bg-transparent text-text-1 placeholder-text-3 resize-none focus:outline-none text-base leading-relaxed"
            rows={1}
          />
        )}

        {block.type.startsWith('heading') && (
          <input
            ref={contentRef}
            type="text"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={`Encabezado ${block.type.split('_')[1]}`}
            className={`w-full bg-transparent placeholder-text-3 resize-none focus:outline-none font-bold text-text-1 ${
              block.type === 'heading_1'
                ? 'text-2xl'
                : block.type === 'heading_2'
                ? 'text-xl'
                : 'text-lg'
            }`}
          />
        )}

        {block.type === 'quote' && (
          <div className="border-l-4 border-text-3 pl-4">
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder="Cita"
              className="w-full bg-transparent text-text-2 italic placeholder-text-3 resize-none focus:outline-none"
              rows={2}
            />
          </div>
        )}

        {block.type === 'callout' && (
          <div className="bg-surface-2 border-l-4 border-yellow-600 rounded p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={block.content.emoji || '💡'}
                maxLength="2"
                className="w-8 bg-transparent text-center focus:outline-none"
                readOnly
              />
              <textarea
                ref={contentRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder="Callout"
                className="flex-1 bg-transparent text-text-1 placeholder-text-3 resize-none focus:outline-none"
                rows={2}
              />
            </div>
          </div>
        )}

        {block.type === 'divider' && (
          <div className="h-px bg-surface-2 my-2" />
        )}

        {block.type === 'code' && (
          <pre className="bg-surface-1 border border-surface-2 rounded p-3 overflow-x-auto">
            <code className="text-text-2 font-mono text-sm">
              <textarea
                ref={contentRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder="// código"
                className="w-full bg-transparent text-text-2 placeholder-text-3 resize-none focus:outline-none font-mono"
                rows={3}
              />
            </code>
          </pre>
        )}
      </div>

      {/* Botón + para agregar bloque debajo */}
      {isLast && (
        <button
          onClick={() => onShowMenu(block.id)}
          className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-text-1 transition-opacity pt-2"
          title="Agregar bloque"
        >
          <Plus size={18} />
        </button>
      )}
    </motion.div>
  )
}
