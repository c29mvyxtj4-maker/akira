import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MENTION_TYPES = {
  person: { icon: '👤', label: 'Personas' },
  page: { icon: '📄', label: 'Páginas' },
  date: { icon: '📅', label: 'Fechas' },
}

export function MentionMenu({ query, onSelect, pages = [], people = [], position = { x: 0, y: 0 } }) {
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const mockPeople = [
    { id: 1, name: 'Marc', email: 'marc@akira.com', avatar: 'M' },
    { id: 2, name: 'Sofia', email: 'sofia@akira.com', avatar: 'S' },
    { id: 3, name: 'Carlos', email: 'carlos@akira.com', avatar: 'C' },
  ]

  const mockPages = [
    { id: 1, title: 'Proyecto AKIRA', icon: '📄' },
    { id: 2, title: 'Roadmap 2026', icon: '🗺️' },
    { id: 3, title: 'Reunión de equipo', icon: '📅' },
  ]

  useEffect(() => {
    const allResults = []

    // Personas
    ;(people.length > 0 ? people : mockPeople).forEach((person) => {
      if (person.name.toLowerCase().includes(query.toLowerCase())) {
        allResults.push({ type: 'person', data: person })
      }
    })

    // Páginas
    ;(pages.length > 0 ? pages : mockPages).forEach((page) => {
      if (page.title.toLowerCase().includes(query.toLowerCase())) {
        allResults.push({ type: 'page', data: page })
      }
    })

    // Fechas (si el query parece una fecha)
    if (query.match(/^\d{1,2}\/\d{1,2}|today|tomorrow|next/i)) {
      allResults.push({ type: 'date', data: { name: `Fecha: ${query}` } })
    }

    setResults(allResults)
    setSelectedIndex(0)
  }, [query, pages, people])

  if (results.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute bottom-full mb-2 bg-surface-0 border border-surface-2 rounded-lg shadow-xl z-50 w-72"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="max-h-64 overflow-y-auto">
        {results.map((result, idx) => (
          <motion.button
            key={`${result.type}-${result.data.id || idx}`}
            whileHover={{ backgroundColor: 'var(--surface-2)' }}
            onClick={() => onSelect?.(result.type, result.data)}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
              idx === selectedIndex ? 'bg-surface-2' : ''
            }`}
          >
            <span className="text-lg">{MENTION_TYPES[result.type].icon}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-1 truncate">
                {result.data.name || result.data.title}
              </p>
              {result.data.email && (
                <p className="text-xs text-text-3 truncate">{result.data.email}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-surface-2 text-xs text-text-3">
        <kbd className="px-2 py-1 bg-surface-1 border border-surface-2 rounded text-xs">↑↓</kbd>
        <span className="ml-2">Navegar</span>
        <kbd className="ml-4 px-2 py-1 bg-surface-1 border border-surface-2 rounded text-xs">↵</kbd>
        <span className="ml-2">Seleccionar</span>
      </div>
    </motion.div>
  )
}
