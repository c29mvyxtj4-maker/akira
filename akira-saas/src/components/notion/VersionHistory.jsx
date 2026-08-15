import { useState } from 'react'
import { Clock, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function VersionHistory({ pageId, versions = [], onRestore }) {
  const [showHistory, setShowHistory] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const mockVersions = [
    {
      id: 1,
      timestamp: 'Hace 5 minutos',
      author: 'Marc',
      changes: 'Editar párrafo principal',
      content: 'Versión actual'
    },
    {
      id: 2,
      timestamp: 'Hace 15 minutos',
      author: 'Marc',
      changes: 'Agregar título',
      content: 'Versión anterior'
    },
    {
      id: 3,
      timestamp: 'Hace 1 hora',
      author: 'Sistema',
      changes: 'Crear página',
      content: 'Versión original'
    },
  ]

  const displayVersions = versions.length > 0 ? versions : mockVersions

  return (
    <div className="relative">
      {/* History button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-1 px-3 py-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1 text-sm"
        title="Historial de versiones"
      >
        <Clock size={16} />
        Historial
      </button>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 bg-surface-0 border border-surface-2 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-2">
              <h3 className="font-semibold text-text-1">Historial de versiones</h3>
              <p className="text-xs text-text-3 mt-1">Últimas cambios en esta página</p>
            </div>

            {/* Versions list */}
            <div className="max-h-96 overflow-y-auto">
              {displayVersions.map((version, idx) => (
                <motion.div
                  key={version.id}
                  whileHover={{ backgroundColor: 'var(--surface-1)' }}
                  onClick={() => setSelectedVersion(version.id)}
                  className={`p-4 border-b border-surface-2 cursor-pointer transition-colors ${
                    selectedVersion === version.id ? 'bg-surface-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-1">{version.changes}</p>
                      <p className="text-xs text-text-3 mt-1">
                        {version.author} • {version.timestamp}
                      </p>
                    </div>

                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestore?.(version.id)
                          setShowHistory(false)
                        }}
                        className="p-2 hover:bg-surface-2 rounded text-text-3 hover:text-text-1 transition-colors"
                        title="Restaurar esta versión"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>

                  {selectedVersion === version.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-surface-1 rounded text-sm text-text-2"
                    >
                      <p>{version.content}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
