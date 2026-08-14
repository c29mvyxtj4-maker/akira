import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Trash2 } from 'lucide-react'

/**
 * EmbedBlock - Embed external content
 * Supports: YouTube, Figma, Twitter, etc.
 */
export default function EmbedBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [embedUrl, setEmbedUrl] = useState(block.metadata?.embedUrl || '')
  const [embedType, setEmbedType] = useState(block.metadata?.embedType || '')
  const [isEditing, setIsEditing] = useState(!embedUrl)

  const getEmbedType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('figma.com')) return 'figma'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('vimeo.com')) return 'vimeo'
    return 'iframe'
  }

  const handleUrlSubmit = (url) => {
    if (!url.trim()) return

    const type = getEmbedType(url)
    setEmbedUrl(url)
    setEmbedType(type)
    setIsEditing(false)

    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        embedUrl: url,
        embedType: type,
      },
    })
  }

  const getEmbedHtml = (url, type) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    } else if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
    return url
  }

  const renderEmbed = () => {
    if (!embedUrl) return null

    const embedSrc = getEmbedHtml(embedUrl, embedType)

    switch (embedType) {
      case 'youtube':
      case 'vimeo':
        return (
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedSrc}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      case 'figma':
        return (
          <iframe
            src={embedUrl}
            className="w-full h-96 rounded-lg border border-surface-2"
            allowFullScreen
          />
        )
      default:
        return (
          <iframe
            src={embedUrl}
            className="w-full h-96 rounded-lg border border-surface-2"
            title="Embedded content"
          />
        )
    }
  }

  return (
    <div className="w-full space-y-3">
      {isEditing && canEdit ? (
        /* URL Input */
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 bg-surface-1 rounded border border-surface-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={18} className="text-text-2" />
            <label className="text-sm font-medium text-text-1">Embed URL</label>
          </div>

          <input
            autoFocus
            type="url"
            placeholder="https://youtube.com/watch?v=... or any embed URL"
            className="w-full px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit(e.target.value)
              }
            }}
            defaultValue={embedUrl}
          />

          <div className="text-xs text-text-3">
            Supports YouTube, Vimeo, Figma, and most embed URLs
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                const input = e.target.closest('div').querySelector('input')
                handleUrlSubmit(input.value)
              }}
              className="flex-1 px-3 py-2 bg-brand-500 text-white rounded text-sm hover:bg-brand-600 transition-colors"
            >
              Embed
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : embedUrl ? (
        /* Embed Display */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group space-y-2"
        >
          <div className="border border-surface-2 rounded-lg overflow-hidden bg-surface-1">
            {renderEmbed()}
          </div>

          {/* Controls */}
          {canEdit && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="flex gap-2 p-2 bg-surface-1 rounded border border-surface-2"
            >
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-3 py-1.5 text-sm text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors flex items-center justify-center gap-1"
              >
                <Link2 size={14} />
                Change URL
              </button>
              <button
                onClick={() => setEmbedUrl('')}
                className="flex-1 px-3 py-1.5 text-sm text-text-2 hover:text-danger hover:bg-surface-0 rounded transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </motion.div>
          )}

          <div className="text-xs text-text-3 p-2">
            {embedType.charAt(0).toUpperCase() + embedType.slice(1)}
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="p-8 border-2 border-dashed border-surface-2 rounded-lg text-center">
          <Link2 size={32} className="mx-auto text-text-3 mb-3" />
          <p className="text-text-1 font-medium mb-1">No embed yet</p>
          <p className="text-text-3 text-sm mb-4">
            Paste a YouTube, Vimeo, Figma, or other embed URL
          </p>
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
            >
              Add Embed
            </button>
          )}
        </div>
      )}
    </div>
  )
}
