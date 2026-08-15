import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function GlobalSearch({ pages = [], onSelect }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Escuchar Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }

      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault()
          onSelect?.(results[selectedIndex])
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onSelect])

  // Buscar páginas
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const mockPages = [
      { id: 1, title: 'Proyecto AKIRA', icon: '📄', type: 'page' },
      { id: 2, title: 'Roadmap 2026', icon: '🗺️', type: 'page' },
      { id: 3, title: 'Reunión de equipo', icon: '📅', type: 'event' },
      { id: 4, title: 'Recursos', icon: '📚', type: 'page' },
    ]

    const filtered = mockPages.filter((page) =>
      page.title.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered)
    setSelectedIndex(0)
  }, [query])

  return (
    <>
      {/* Search button - top bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg hover:border-surface-3 transition-colors text-text-3 text-sm z-30"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline px-2 py-1 bg-surface-2 rounded text-xs ml-auto">⌘K</kbd>
      </button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-surface-0 border border-surface-2 rounded-lg shadow-2xl z-50"
            >
              {/* Search input */}
              <div className="p-4 border-b border-surface-2 flex items-center gap-3">
                <Search size={20} className="text-text-3" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar páginas, personas, fechas..."
                  className="flex-1 bg-transparent text-text-1 placeholder-text-3 focus:outline-none text-base"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-text-3 hover:text-text-1"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-text-3">
                    {query ? (
                      <p>No se encontraron resultados para "{query}"</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm">Escribe para buscar</p>
                        <div className="text-xs text-text-3 space-y-1">
                          <p>📄 Páginas</p>
                          <p>👤 Personas</p>
                          <p>📅 Eventos</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  results.map((result, idx) => (
                    <motion.button
                      key={result.id}
                      whileHover={{ backgroundColor: 'var(--surface-2)' }}
                      onClick={() => {
                        onSelect?.(result)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-surface-2 last:border-b-0 ${
                        idx === selectedIndex ? 'bg-surface-2' : ''
                      }`}
                    >
                      <span className="text-lg">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-1 truncate">{result.title}</p>
                        <p className="text-xs text-text-3">{result.type}</p>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-surface-2 flex items-center justify-between text-xs text-text-3 bg-surface-1">
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-surface-2 rounded">↑↓</kbd>
                  <span>Navegar</span>
                  <kbd className="px-2 py-1 bg-surface-2 rounded ml-2">↵</kbd>
                  <span>Ir</span>
                  <kbd className="px-2 py-1 bg-surface-2 rounded ml-2">ESC</kbd>
                  <span>Cerrar</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
