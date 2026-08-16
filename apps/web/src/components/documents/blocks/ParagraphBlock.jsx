import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bold, Italic, Underline, Palette, Link2 } from 'lucide-react'

/**
 * ParagraphBlock - Basic text paragraph block
 * Supports inline formatting: bold, italic, underline, color
 */
export default function ParagraphBlock({
  block,
  onUpdate,
  canEdit,
  onSlashCommand,
}) {
  const [content, setContent] = useState(block.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
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

  const handleBold = () => {
    document.execCommand('bold', false, null)
    contentRef.current?.focus()
  }

  const handleItalic = () => {
    document.execCommand('italic', false, null)
    contentRef.current?.focus()
  }

  const handleUnderline = () => {
    document.execCommand('underline', false, null)
    contentRef.current?.focus()
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
          className="w-full text-base leading-relaxed text-text-1 focus:outline-none empty:before:content-['Type_/_for_commands'] empty:before:text-text-3"
          style={{
            minHeight: '1.5em',
            wordWrap: 'break-word',
          }}
        >
          {content}
        </div>
      ) : (
        <div className="w-full text-base leading-relaxed text-text-1 whitespace-pre-wrap break-words">
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
            onClick={handleBold}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={handleItalic}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={handleUnderline}
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Underline (Ctrl+U)"
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
          <button
            className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            title="Link"
          >
            <Link2 size={16} />
          </button>
        </motion.div>
      )}
    </div>
  )
}
