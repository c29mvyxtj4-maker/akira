import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, FileText, Users, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const RESULT_TYPES = {
  clients: { label: 'Clientes', icon: Users, color: '#3b82f6' },
  projects: { label: 'Proyectos', icon: Briefcase, color: '#22c55e' },
  documents: { label: 'Documentos', icon: FileText, color: '#f59e0b' },
  invoices: { label: 'Facturas', icon: FileText, color: '#ef4444' },
}

export default function GlobalSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({})
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const saved = localStorage.getItem('recentSearches')
    setRecentSearches(saved ? JSON.parse(saved) : [])
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults({})
      return
    }

    const searchAsync = async () => {
      setLoading(true)
      const q = query.toLowerCase()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Buscar clientes
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, email')
          .eq('org_id', user.user_metadata?.org_id)
          .ilike('name', `%${q}%`)
          .limit(5)

        // Buscar proyectos
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title, status')
          .eq('org_id', user.user_metadata?.org_id)
          .ilike('title', `%${q}%`)
          .limit(5)

        // Buscar documentos
        const { data: documents } = await supabase
          .from('documents')
          .select('id, title')
          .eq('org_id', user.user_metadata?.org_id)
          .ilike('title', `%${q}%`)
          .limit(5)

        // Buscar facturas
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, number, client_id')
          .eq('org_id', user.user_metadata?.org_id)
          .ilike('number', `%${q}%`)
          .limit(5)

        setResults({
          clients: clients || [],
          projects: projects || [],
          documents: documents || [],
          invoices: invoices || [],
        })
      } catch (error) {
        console.error('Search error:', error)
      }

      setLoading(false)
    }

    const debounce = setTimeout(searchAsync, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (result) => {
    const searches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(searches))
    onSelect?.(result)
  }

  const hasResults = Object.values(results).some(r => r.length > 0)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: '100px',
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        style={{
          width: '90%',
          maxWidth: '600px',
          margin: '0 auto',
          background: '#1a1a2e',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar clientes, proyectos, documentos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#f1f1f4',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
          {loading && <div style={{ color: 'rgba(255,255,255,0.5)', padding: '16px', textAlign: 'center' }}>Buscando...</div>}

          {!loading && query && !hasResults && (
            <div style={{ color: 'rgba(255,255,255,0.5)', padding: '16px', textAlign: 'center' }}>Sin resultados</div>
          )}

          {!query && recentSearches.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '8px 12px', textTransform: 'uppercase' }}>
                Búsquedas recientes
              </div>
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSelect({ type: 'search', query: s }) }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: '#f1f1f4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Clock size={14} style={{ opacity: 0.5 }} />
                  {s}
                </button>
              ))}
            </div>
          )}

          {query && hasResults && (
            Object.entries(results).map(([type, items]) =>
              items.length > 0 && (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: RESULT_TYPES[type]?.color, padding: '8px 12px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {RESULT_TYPES[type]?.label}
                  </div>
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { handleSelect({ ...item, type }); onClose?.() }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f1f4',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderRadius: '6px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {item.name || item.title || item.number}
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        {item.email || item.status || ''}
                      </div>
                    </button>
                  ))}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  )
}
