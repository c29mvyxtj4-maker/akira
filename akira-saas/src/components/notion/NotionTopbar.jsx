import { useState } from 'react'
import { ChevronDown, Share2, Link2, Star, MoreHorizontal, Languages } from 'lucide-react'
import { motion } from 'framer-motion'

export function NotionTopbar({ page, onTranslate, onShare }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="sticky top-0 bg-surface-0/95 backdrop-blur border-b border-surface-2 z-50">
      <div className="h-14 flex items-center justify-between px-6 max-w-full">

        {/* Breadcrumb izquierda */}
        <div className="flex items-center gap-2 text-sm text-text-3">
          <div className="flex items-center gap-1">
            <span>Mi Workspace</span>
            <ChevronDown size={16} />
          </div>
          <span>/</span>
          <span className="text-text-1 font-medium">{page?.title || 'Untitled'}</span>
        </div>

        {/* Botones derecha */}
        <div className="flex items-center gap-2">
          {/* Traducir */}
          <button
            onClick={onTranslate}
            className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1 flex items-center gap-1 text-sm"
            title="Traducir"
          >
            <Languages size={18} />
            <span className="hidden sm:inline">Traducir</span>
          </button>

          {/* Compartir */}
          <button
            onClick={onShare}
            className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1"
            title="Compartir"
          >
            <Share2 size={18} />
          </button>

          {/* Copiar enlace */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
            }}
            className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1"
            title="Copiar enlace"
          >
            <Link2 size={18} />
          </button>

          {/* Favorito */}
          <button
            className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1"
            title="Agregar a favoritos"
          >
            <Star size={18} />
          </button>

          {/* Menú más opciones */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1"
              title="Más opciones"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 bg-surface-1 border border-surface-2 rounded-lg shadow-lg w-48 z-50"
              >
                <button className="w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-text-1 rounded-t-lg">
                  📋 Duplicar
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-text-1">
                  🔄 Historial de versiones
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-text-1">
                  ⚙️ Configuración de página
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-status-danger rounded-b-lg">
                  🗑️ Eliminar
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
