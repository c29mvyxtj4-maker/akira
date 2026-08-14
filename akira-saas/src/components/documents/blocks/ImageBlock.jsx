import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Edit2 } from 'lucide-react'

/**
 * ImageBlock - Image display and upload
 * Supports file upload or URL paste
 * Resizable with caption
 */
export default function ImageBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [imageUrl, setImageUrl] = useState(block.metadata?.imageUrl || '')
  const [caption, setCaption] = useState(block.metadata?.caption || '')
  const [width, setWidth] = useState(block.metadata?.width || '100%')
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleImageUrlChange = (url) => {
    setImageUrl(url)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        imageUrl: url,
      },
    })
  }

  const handleCaptionChange = (newCaption) => {
    setCaption(newCaption)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        caption: newCaption,
      },
    })
  }

  const handleWidthChange = (newWidth) => {
    setWidth(newWidth)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        width: newWidth,
      },
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        handleImageUrlChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        handleImageUrlChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="w-full space-y-3">
      {!imageUrl && canEdit ? (
        /* Upload Area */
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-brand-500 bg-brand-500/5'
              : 'border-surface-2 bg-surface-1 hover:border-brand-500'
          }`}
        >
          <Upload size={32} className="mx-auto text-text-3 mb-3" />
          <p className="text-text-1 font-medium mb-2">Upload an image</p>
          <p className="text-text-3 text-sm mb-4">
            Drag and drop or click to browse
          </p>
          <label className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg cursor-pointer hover:bg-brand-600 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            Choose File
          </label>
          <div className="mt-4 border-t border-surface-2 pt-4">
            <p className="text-text-3 text-sm mb-2">Or paste a URL:</p>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleImageUrlChange(e.target.value)
                }
              }}
            />
          </div>
        </motion.div>
      ) : (
        /* Image Display */
        <>
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group border border-surface-2 rounded-lg overflow-hidden"
            >
              <div className="relative flex items-center justify-center bg-surface-1">
                <img
                  src={imageUrl}
                  alt="Document image"
                  style={{ maxWidth: width, maxHeight: '500px' }}
                  className="max-w-full h-auto object-cover"
                />
              </div>

              {/* Image Controls */}
              {canEdit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute top-2 right-2 flex gap-1 bg-surface-0/90 backdrop-blur rounded-lg p-2"
                >
                  <button
                    onClick={() => setWidth(width === '100%' ? '50%' : '100%')}
                    className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-1 rounded transition-colors"
                    title="Toggle size"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleImageUrlChange('')}
                    className="p-1.5 text-text-2 hover:text-danger hover:bg-surface-1 rounded transition-colors"
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Caption */}
          {isEditingCaption && canEdit ? (
            <input
              autoFocus
              type="text"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              onBlur={() => setIsEditingCaption(false)}
              placeholder="Add caption..."
              className="w-full px-3 py-2 bg-surface-1 border border-surface-2 rounded text-sm text-text-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center italic"
            />
          ) : (
            <div
              onClick={() => canEdit && setIsEditingCaption(true)}
              className={`text-sm text-text-3 text-center italic ${
                canEdit ? 'hover:text-text-2 cursor-text hover:bg-surface-1 px-3 py-2 rounded' : ''
              }`}
            >
              {caption || (canEdit ? 'Click to add caption...' : '')}
            </div>
          )}
        </>
      )}
    </div>
  )
}
