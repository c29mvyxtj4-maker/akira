import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const COMMANDS = [
  { type: 'paragraph', label: 'Párrafo', icon: '¶', description: 'Texto normal' },
  { type: 'heading_1', label: 'Encabezado 1', icon: 'H1', description: 'Título grande' },
  { type: 'heading_2', label: 'Encabezado 2', icon: 'H2', description: 'Título mediano' },
  { type: 'heading_3', label: 'Encabezado 3', icon: 'H3', description: 'Título pequeño' },
  { type: 'bulleted_list', label: 'Lista de viñetas', icon: '•', description: 'Lista sin orden' },
  { type: 'numbered_list', label: 'Lista numerada', icon: '1.', description: 'Lista ordenada' },
  { type: 'checklist', label: 'Checklist', icon: '☑', description: 'Lista de tareas' },
  { type: 'toggle', label: 'Toggle', icon: '▶', description: 'Contenido expandible' },
  { type: 'quote', label: 'Cita', icon: '❝', description: 'Texto citado' },
  { type: 'divider', label: 'Divisor', icon: '—', description: 'Línea horizontal' },
  { type: 'code', label: 'Código', icon: '<>', description: 'Bloque de código' },
  { type: 'callout', label: 'Callout', icon: '💡', description: 'Cuadro destacado' },
  { type: 'columns', label: 'Columnas', icon: '⫸', description: 'Layout en columnas' },
  { type: 'image', label: 'Imagen', icon: '🖼', description: 'Insertar imagen' },
]

export function CommandPalette({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(0)

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setSelected(0)
  }, [search])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((prev) => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onSelect(filtered[selected].type)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed inset-0 flex items-start justify-center pt-24 bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface-1 border border-surface-2 rounded-lg shadow-xl w-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-4 border-b border-surface-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe para buscar o presiona / para ver todo..."
            className="w-full bg-transparent text-text-1 placeholder-text-3 focus:outline-none text-sm"
          />
        </div>

        {/* Commands list */}
        <div className="max-h-96 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => (
              <motion.button
                key={cmd.type}
                onClick={() => onSelect(cmd.type)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  idx === selected ? 'bg-surface-2' : 'hover:bg-surface-2'
                }`}
                whileHover={{ x: 4 }}
              >
                <span className="text-lg">{cmd.icon}</span>
                <div className="flex-1">
                  <div className="text-text-1 font-medium text-sm">{cmd.label}</div>
                  <div className="text-text-3 text-xs">{cmd.description}</div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="p-4 text-center text-text-3 text-sm">Sin resultados</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
