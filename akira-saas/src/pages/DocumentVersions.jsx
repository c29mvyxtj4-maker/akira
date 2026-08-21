import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, FileText, User } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppLayout from '@/shared/components/layout/AppLayout'
import Toast, { useToast } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { getDocumentVersions, restoreDocumentVersion } from '@/services/documents.service'

export default function DocumentVersionsPage() {
  const navigate = useNavigate()
  const { documentId } = useParams()
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    loadVersions()
  }, [documentId])

  const loadVersions = async () => {
    try {
      setLoading(true)
      const { data } = await getDocumentVersions(documentId)
      setVersions(data || [])
      if (data && data.length > 0) {
        setSelectedVersion(data[0])
      }
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const { toasts, show, dismiss } = useToast()
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(null)

  const handleRestore = async (version) => {
    setShowRestoreConfirm(version)
  }

  const confirmRestore = async () => {
    if (!showRestoreConfirm) return

    try {
      setRestoring(true)
      await restoreDocumentVersion(documentId, showRestoreConfirm.id)
      show('Versión restaurada exitosamente', 'success', 3000)
      setShowRestoreConfirm(null)
      navigate(`/documents/${documentId}`)
    } catch (error) {
      show('Error al restaurar versión: ' + (error.message || error), 'error', 3000)
      setShowRestoreConfirm(null)
    } finally {
      setRestoring(false)
    }
  }

  const header = (
    <div style={{
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-3)',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-1)',
          }}>
            Historial de versiones
          </h1>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--text-3)',
          }}>
            {versions.length} versiones guardadas
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <AppLayout header={header}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        padding: 'var(--space-4)',
        height: '100%',
      }}>
        {/* Versions List */}
        <div style={{
          borderRight: '1px solid var(--border)',
          paddingRight: 'var(--space-4)',
          overflowY: 'auto',
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'var(--text-3)',
              fontSize: '14px',
            }}>
              Cargando versiones...
            </div>
          ) : versions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-3)',
              fontSize: '13px',
              padding: 'var(--space-4)',
            }}>
              No hay versiones previas
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {versions.map((version, idx) => (
                <motion.button
                  key={version.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedVersion(version)}
                  style={{
                    padding: '12px',
                    background: selectedVersion?.id === version.id ? 'var(--bg-2)' : 'transparent',
                    border: `1px solid ${selectedVersion?.id === version.id ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms',
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: '4px',
                  }}>
                    {idx === 0 ? 'Versión actual' : `Versión ${versions.length - idx}`}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-3)',
                    marginBottom: '4px',
                  }}>
                    {new Date(version.created_at).toLocaleString('es-ES')}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <User size={10} />
                    {version.profiles?.full_name || 'Usuario desconocido'}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Version Preview */}
        <div>
          {selectedVersion ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-1)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {/* Header */}
              <div style={{
                borderBottom: '1px solid var(--border)',
                paddingBottom: 'var(--space-3)',
              }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                }}>
                  {selectedVersion.title || 'Documento sin título'}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-2)',
                  fontSize: '12px',
                  color: 'var(--text-3)',
                }}>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 600 }}>Fecha</p>
                    {new Date(selectedVersion.created_at).toLocaleString('es-ES')}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 600 }}>Autor</p>
                    {selectedVersion.profiles?.full_name || 'Usuario desconocido'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-3)',
                background: 'var(--bg-0)',
                borderRadius: '8px',
                minHeight: '300px',
                maxHeight: '500px',
              }}>
                <div
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text-1)',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: selectedVersion.content || '<p>Sin contenido</p>',
                  }}
                />
              </div>

              {/* Actions */}
              {versions[0]?.id !== selectedVersion.id && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRestore(selectedVersion)}
                  disabled={restoring}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--brand)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: restoring ? 0.5 : 1,
                  }}
                >
                  <RotateCcw size={16} />
                  {restoring ? 'Restaurando...' : 'Restaurar esta versión'}
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-3)',
              fontSize: '14px',
            }}>
              Selecciona una versión para ver
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRestoreConfirm !== null}
        title="Restaurar versión"
        message={showRestoreConfirm ? `¿Restaurar a la versión del ${new Date(showRestoreConfirm.created_at).toLocaleString('es-ES')}?` : ''}
        confirmText="Restaurar"
        cancelText="Cancelar"
        onConfirm={confirmRestore}
        onCancel={() => setShowRestoreConfirm(null)}
      />
    </AppLayout>
  )
}
