import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bold, Italic, Underline, Palette } from 'lucide-react'

/**
 * HeadingBlock - Heading 1, 2, or 3
 * Larger, bold text for section organization
 */
export default function HeadingBlock({
  block,
  onUpdate,
  canEdit,
  onSlashCommand,
}) {
  const [content, setContent] = useState(block.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    setContent(block.content || '')
  }, [block.content])

  const handleContentChange = (e) => {
    const newContent = e.currentTarget.textContent || ''
    setContent(newContent)
  }

  const handleBlur = () => {
    if (content !== block.content) {
      onUpdate(block.id, { content })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === '/' && content === '') {
      e.preventDefault()
      onSlashCommand?.()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleBlur()
    }
  }

  // Determine heading size based on type
  const getHeadingClasses = () => {
    switch (block.type) {
      case 'heading1':
        return 'text-4xl font-bold leading-tight'
      case 'heading2':
        return 'text-3xl font-bold leading-tight'
      case 'heading3':
        return 'text-2xl font-semibold leading-snug'
      default:
        return 'text-3xl font-bold'
    }
  }

  return (
    <div className="w-full">
      {canEdit ? (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onBlur={handleBlur}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          onClick={() => setIsEditing(true)}
          className={`w-full text-text-1 focus:outline-none empty:before:text-text-3 ${getHeadingClasses()}`}
          style={{
            minHeight: '1.2em',
            wordWrap: 'break-word',
          }}
        >
          {content}
        </div>
      ) : (
        <div className={`w-full text-text-1 whitespace-pre-wrap break-words ${getHeadingClasses()}`}>
          {content || '(Empty)'}
        </div>
      )}

      {/* Inline Formatting Toolbar */}
      {isEditing && canEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1 mt-2 p-2 bg-surface-1 rounded border border-surface-2"
        >
          <button
            onClick={() => document.execCommand('bold')}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => document.execCommand('italic')}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => document.execCommand('underline')}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          <div className="w-px bg-surface-2" />
          <button
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Text color"
          >
            <Palette size={16} />
          </button>
        </motion.div>
      )}
    </div>
  )
}
