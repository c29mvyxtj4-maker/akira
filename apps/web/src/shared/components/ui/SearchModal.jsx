import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, Users, FolderKanban, Wallet, Calendar } from 'lucide-react'

const getIcon = (type) => {
  const icons = {
    client: <Users size={16} />,
    project: <FolderKanban size={16} />,
    invoice: <FileText size={16} />,
    finance: <Wallet size={16} />,
    calendar: <Calendar size={16} />,
  }
  return icons[type] || <FileText size={16} />
}

const getCategory = (date) => {
  if (!date) return 'Otros'
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoy'
  if (diffDays <= 7) return 'Última semana'
  if (diffDays <= 30) return 'Últimos 30 días'
  return 'Anteriores'
}

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [allResults, setAllResults] = useState([])
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
      }
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    async function searchAll() {
      if (!query.trim()) {
        setAllResults([])
        setGrouped({})
        return
      }

      setLoading(true)
      try {
        const q = query.toLowerCase()
        const mockData = [
          { id: '1', title: 'Dashboard', type: 'page', category: 'Páginas', date: new Date(), desc: 'Centro de mando - KPIs y análisis' },
          { id: '2', title: 'Clientes', type: 'client', category: 'Páginas', date: new Date(), desc: 'Gestión de clientes y CRM' },
          { id: '3', title: 'Proyectos', type: 'project', category: 'Páginas', date: new Date(), desc: 'Kanban y seguimiento de proyectos' },
          { id: '4', title: 'Finanzas', type: 'finance', category: 'Páginas', date: new Date(), desc: 'Análisis financiero y reportes' },
          { id: '5', title: 'Invoices', type: 'invoice', category: 'Páginas', date: new Date(), desc: 'Gestión de facturas y cobros' },
        ]

        const filtered = mockData.filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
        )

        setAllResults(filtered)

        const grouped = {}
        filtered.forEach(item => {
          const cat = getCategory(item.date)
          if (!grouped[cat]) grouped[cat] = []
          grouped[cat].push(item)
        })
        setGrouped(grouped)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchAll, 300)
    return () => clearTimeout(timer)
  }, [query])

  const categories = ['Hoy', 'Última semana', 'Últimos 30 días', 'Anteriores']

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div>
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
            }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-1)',
              borderRadius: '16px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '75vh',
              overflow: 'hidden',
              zIndex: 501,
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-1)',
            }}>
              <Search style={{ width: '20px', height: '20px', color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                autoFocus
                type="text"
                placeholder="Buscar páginas, clientes, proyectos, facturas..."
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
                  flexShrink: 0,
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Buscando...
                </div>
              ) : allResults.length > 0 ? (
                categories.map(cat => grouped[cat]?.length > 0 && (
                  <div key={cat}>
                    <div style={{
                      padding: '12px 20px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderTop: '1px solid var(--border)',
                    }}>
                      {cat}
                    </div>
                    {grouped[cat].map((item) => (
                      <button
                        key={item.id}
                        onClick={onClose}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          background: 'var(--bg-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--brand-500)',
                          flexShrink: 0,
                        }}>
                          {getIcon(item.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 500 }}>
                            {item.title}
                          </div>
                          <div style={{ color: 'var(--text-4)', fontSize: '12px', marginTop: '2px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              ) : query.trim() ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'var(--text-3)',
                }}>
                  No se encontraron resultados para "{query}"
                </div>
              ) : (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'var(--text-3)',
                  fontSize: '14px',
                }}>
                  Escribe para buscar en páginas, clientes, proyectos...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
