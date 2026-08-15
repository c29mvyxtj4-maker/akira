import { useState } from 'react'
import { Trash2, RotateCcw, Trash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function TrashBin({ trashedPages = [], onRestore, onDelete }) {
  const [showTrash, setShowTrash] = useState(false)

  const mockTrashed = [
    {
      id: 1,
      title: 'Página antigua',
      icon: '📄',
      deletedAt: 'Hace 2 días',
      deletedBy: 'Marc',
    },
    {
      id: 2,
      title: 'Proyecto cancelado',
      icon: '🗑️',
      deletedAt: 'Hace 1 semana',
      deletedBy: 'Sofia',
    },
  ]

  const displayTrash = trashedPages.length > 0 ? trashedPages : mockTrashed

  return (
    <div className="relative">
      {/* Trash button */}
      <button
        onClick={() => setShowTrash(!showTrash)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface-3 text-text-2 text-sm rounded transition-colors"
      >
        <Trash2 size={16} />
        Papelera ({displayTrash.length})
      </button>

      {/* Trash panel */}
      <AnimatePresence>
        {showTrash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full mb-2 left-0 w-80 bg-surface-0 border border-surface-2 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-2">
              <h3 className="font-semibold text-text-1">Papelera</h3>
              <p className="text-xs text-text-3 mt-1">Se eliminan permanentemente después de 30 días</p>
            </div>

            {/* Items list */}
            <div className="max-h-64 overflow-y-auto">
              {displayTrash.length === 0 ? (
                <div className="p-8 text-center text-text-3">
                  <p className="text-sm">Papelera vacía</p>
                </div>
              ) : (
                displayTrash.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ backgroundColor: 'var(--surface-1)' }}
                    className="p-4 border-b border-surface-2 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <p className="font-medium text-text-1 text-sm">{item.title}</p>
                        </div>
                        <p className="text-xs text-text-3 mt-1">
                          Eliminado hace {item.deletedAt} por {item.deletedBy}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => {
                            onRestore?.(item.id)
                            setShowTrash(false)
                          }}
                          className="p-2 hover:bg-surface-2 rounded text-blue-600 hover:text-blue-700 transition-colors"
                          title="Restaurar"
                        >
                          <RotateCcw size={16} />
                        </button>

                        <button
                          onClick={() => onDelete?.(item.id)}
                          className="p-2 hover:bg-surface-2 rounded text-status-danger hover:text-red-700 transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
