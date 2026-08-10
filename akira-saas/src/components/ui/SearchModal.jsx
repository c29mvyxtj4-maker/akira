import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onClose === false ? onOpen?.() : onClose?.()
      }
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const mockResults = [
      { id: 1, title: 'Dashboard', category: 'Páginas' },
      { id: 2, title: 'Clientes', category: 'Páginas' },
      { id: 3, title: 'Proyectos', category: 'Páginas' },
      { id: 4, title: 'Finanzas', category: 'Páginas' },
      { id: 5, title: 'Invoices', category: 'Páginas' },
    ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()))

    setResults(mockResults)
  }, [query])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 500,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '80px',
            }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-1)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '500px',
              overflow: 'hidden',
              zIndex: 501,
            }}
          >
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <Search style={{ width: '20px', height: '20px', color: 'var(--text-3)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Buscar páginas, clientes, proyectos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-1)',
                  fontSize: '16px',
                }}
              />
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={onClose}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 500 }}>
                        {result.title}
                      </div>
                      <div style={{ color: 'var(--text-4)', fontSize: '12px', marginTop: '2px' }}>
                        {result.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-3)',
              }}>
                No se encontraron resultados para "{query}"
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: '14px',
              }}>
                Escribe para buscar...
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
