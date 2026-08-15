import { useState } from 'react'
import { motion } from 'framer-motion'

export function NotionPageHeader({ page, onUpdateTitle, onUpdateDescription }) {
  const [title, setTitle] = useState(page?.title || 'Untitled')
  const [description, setDescription] = useState(page?.description || '')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    onUpdateTitle?.(title)
  }

  const handleDescBlur = () => {
    setIsEditingDesc(false)
    onUpdateDescription?.(description)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-surface-2 pb-8 mb-8"
    >
      {/* Cover image */}
      {page?.cover_image && (
        <div className="h-48 bg-gradient-to-br from-surface-2 to-surface-1 rounded-lg mb-6 overflow-hidden">
          <img src={page.cover_image} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Icon + Title */}
      <div className="flex items-start gap-4">
        <div className="text-6xl">{page?.icon || '📄'}</div>

        <div className="flex-1 pt-2">
          {/* Title */}
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur()
              }}
              className="text-5xl font-bold text-text-1 bg-transparent focus:outline-none w-full"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-5xl font-bold text-text-1 cursor-text hover:bg-surface-2 px-2 py-1 rounded transition-colors"
            >
              {title}
            </h1>
          )}

          {/* Description */}
          {isEditingDesc ? (
            <textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Agregar descripción..."
              className="mt-2 text-text-2 text-base bg-transparent focus:outline-none w-full resize-none placeholder-text-3"
              rows={2}
            />
          ) : (
            <p
              onClick={() => setIsEditingDesc(true)}
              className={`mt-2 text-base cursor-text hover:bg-surface-2 px-2 py-1 rounded transition-colors ${
                description ? 'text-text-2' : 'text-text-3'
              }`}
            >
              {description || 'Agregar descripción...'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
