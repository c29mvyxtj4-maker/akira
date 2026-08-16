import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, RefreshCw } from 'lucide-react'
import { generateProjectSummary } from '@/services/brain.service'

export default function ProjectSummaryCard({ project }) {
  var [summary, setSummary] = useState(null)
  var [loading, setLoading] = useState(false)
  var [error,   setError]   = useState('')

  function handleGenerate() {
    setLoading(true)
    setError('')
    generateProjectSummary(project)
      .then(function(text) { setSummary(text) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setLoading(false) })
  }

  return (
    <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)' }}>
      <AnimatePresence mode="wait">
        {summary ? (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#e63946', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ flex: 1, fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>{summary}</p>
            <button type="button" onClick={handleGenerate} disabled={loading} title="Regenerar"
              style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text-4)', flexShrink: 0, display: 'flex' }}
            >
              <RefreshCw style={{ width: '13px', height: '13px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </motion.div>
        ) : (
          <motion.button key="button" type="button" onClick={handleGenerate} disabled={loading}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: '#e63946', fontSize: '13px', fontWeight: 600, width: '100%' }}
          >
            {loading ? (
              <><RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Generando resumen...</>
            ) : (
              <><Zap style={{ width: '14px', height: '14px' }} /> Generar resumen con IA</>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>Error: {error}</p>}

      <style>{'@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }'}</style>
    </div>
  )
}