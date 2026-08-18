import { useState, lazy, Suspense } from 'react'
import { FileText } from 'lucide-react'

// TipTap pesa ~500KB: se carga solo cuando se necesita
const TipTapEditor = lazy(() => import('@/components/knowledge/TipTapEditor'))

export default function DocumentsNotion() {
  const [showEditor, setShowEditor] = useState(false)
  const [demoDoc] = useState({
    id: 'demo-1',
    title: 'Mi Primer Documento',
    content: '<p>Comienza a escribir aquí... Prueba escribiendo / para ver las opciones</p>',
    icon: '📝'
  })

  if (showEditor) {
    return (
      <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Cargando editor...</div>}>
        <TipTapEditor
          doc={demoDoc}
          onClose={() => setShowEditor(false)}
        />
      </Suspense>
    )
  }

  return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={24} style={{ color: '#e63946' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f1f4' }}>Documentos</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Editor Notion-like integrado</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', background: '#e63946', border: 'none',
            borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#d62828'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#e63946'}
        >
          + Abrir Editor
        </button>
      </div>

      {/* Descripción */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📝</div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#f1f1f4', margin: '0 0 16px 0' }}>
            Editor Notion-like
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Editor de documentos con slash commands. Escribe <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#f1f1f4' }}>/</code> para ver todas las opciones disponibles.
          </p>

          <div style={{ background: 'rgba(230, 57, 70, 0.1)', border: '1px solid rgba(230, 57, 70, 0.3)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e63946', fontSize: '14px', fontWeight: 600 }}>✨ Características:</h3>
            <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.8' }}>
              <li>✓ Bloques de texto, encabezados (H1-H4)</li>
              <li>✓ Listas con viñetas, numeradas y de tareas</li>
              <li>✓ Tablas, código y citas</li>
              <li>✓ Callouts destacados con iconos</li>
              <li>✓ Imágenes y videos de YouTube</li>
              <li>✓ Ecuaciones matemáticas</li>
              <li>✓ Comando "/" para acceso rápido</li>
            </ul>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            style={{
              padding: '12px 28px', background: '#e63946', border: 'none',
              borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#d62828'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#e63946'}
          >
            Abrir Editor
          </button>
        </div>
      </div>
    </div>
  )
}
