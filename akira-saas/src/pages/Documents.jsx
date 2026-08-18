import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, FileText, Settings } from 'lucide-react'
import { useKnowledge } from '@/shared/hooks/useKnowledge'

// TipTap pesa ~500KB: se carga solo al abrir un documento
const TipTapEditor = lazy(() => import('@/components/knowledge/TipTapEditor'))

export default function Documents() {
  const { documents, loading, currentDoc, setCurrentDoc, updateDocument } = useKnowledge()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [saving, setSaving] = useState(false)

  // Si no hay documento actual, mostramos la lista
  if (!currentDoc) {
    return (
      <div style={{ height: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} style={{ color: '#e63946' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f1f4' }}>Documentos</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Gestor de documentos integrado</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: '#e63946', border: 'none',
              borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#d62828'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#e63946'}
          >
            <Plus size={16} />
            Nuevo documento
          </button>
        </div>

        {/* Lista de documentos */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' }}>
              Cargando documentos...
            </div>
          ) : documents && documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setCurrentDoc(doc)}
                  style={{
                    padding: '16px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{doc.icon || '📄'}</div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: '#f1f1f4' }}>{doc.title}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Sin fecha'}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p>No hay documentos aún</p>
              <p style={{ fontSize: '12px' }}>Crea tu primer documento para empezar</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Si hay documento actual, mostramos el editor
  return (
    <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Cargando editor...</div>}>
      <TipTapEditor
        doc={currentDoc}
        onClose={() => setCurrentDoc(null)}
      />
    </Suspense>
  )
}
