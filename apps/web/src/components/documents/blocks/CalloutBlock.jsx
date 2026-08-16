import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'

/**
 * CalloutBlock - Highlighted note/alert block
 * Types: info, warning, success, error, idea, custom
 * Customizable icon and color
 */
export default function CalloutBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [content, setContent] = useState(block.content || '')
  const [calloutType, setCalloutType] = useState(block.metadata?.calloutType || 'info')
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const CALLOUT_TYPES = [
    { id: 'info', label: 'Info', icon: Info, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { id: 'success', label: 'Success', icon: CheckCircle, color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'error', label: 'Error', icon: AlertCircle, color: 'bg-red-50 border-red-200 text-red-700' },
    { id: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'note', label: 'Note', icon: MessageCircle, color: 'bg-gray-50 border-gray-200 text-gray-700' },
  ]

  const currentType = CALLOUT_TYPES.find((t) => t.id === calloutType) || CALLOUT_TYPES[0]
  const Icon = currentType.icon

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

  const handleTypeChange = (newType) => {
    setCalloutType(newType)
    onUpdate(block.id, {
      ...block,
      metadata: {
        ...block.metadata,
        calloutType: newType,
      },
    })
    setShowTypeMenu(false)
  }

  return (
    <div className="w-full space-y-2">
      {/* Type Selector (if editing) */}
      {canEdit && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface-1 border border-surface-2 rounded text-sm text-text-1 hover:border-brand-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon size={16} />
              {currentType.label}
            </div>
            <ChevronDown size={16} className={`transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} />
          </button>

          {showTypeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 z-50 w-full bg-surface-0 border border-surface-2 rounded-lg shadow-lg overflow-hidden"
            >
              {CALLOUT_TYPES.map((type) => {
                const TypeIcon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`block w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-surface-1 transition-colors ${
                      calloutType === type.id ? 'bg-brand-500/10 border-l-2 border-brand-500' : ''
                    }`}
                  >
                    <TypeIcon size={16} />
                    <span className="text-sm">{type.label}</span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Callout Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border-l-4 flex gap-3 items-start ${
          calloutType === 'info'
            ? 'bg-blue-50/50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600'
            : calloutType === 'warning'
            ? 'bg-yellow-50/50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600'
            : calloutType === 'success'
            ? 'bg-green-50/50 border-green-400 dark:bg-green-900/20 dark:border-green-600'
            : calloutType === 'error'
            ? 'bg-red-50/50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
            : calloutType === 'idea'
            ? 'bg-purple-50/50 border-purple-400 dark:bg-purple-900/20 dark:border-purple-600'
            : 'bg-gray-50/50 border-gray-400 dark:bg-gray-900/20 dark:border-gray-600'
        }`}
      >
        {/* Icon */}
        <Icon
          size={20}
          className={`flex-shrink-0 mt-0.5 ${
            calloutType === 'info'
              ? 'text-blue-500'
              : calloutType === 'warning'
              ? 'text-yellow-500'
              : calloutType === 'success'
              ? 'text-green-500'
              : calloutType === 'error'
              ? 'text-red-500'
              : calloutType === 'idea'
              ? 'text-purple-500'
              : 'text-gray-500'
          }`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {canEdit && isEditing ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentChange}
              onBlur={handleBlur}
              onClick={() => setIsEditing(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleBlur()
                }
              }}
              className="w-full text-sm leading-relaxed text-text-1 focus:outline-none empty:before:content-['Type_your_callout_text_here...'] empty:before:text-text-3"
              style={{
                minHeight: '1.5em',
              }}
            >
              {content}
            </div>
          ) : (
            <div
              onClick={() => canEdit && setIsEditing(true)}
              className={`text-sm leading-relaxed text-text-1 ${
                canEdit ? 'cursor-text hover:bg-black/5 px-1 py-0.5 rounded' : ''
              }`}
            >
              {content || (canEdit ? 'Click to add text...' : '(Empty)')}
            </div>
          )}
        </div>
      </motion.div>

      {/* Type Badge (read-only) */}
      {!canEdit && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-1 rounded text-xs text-text-2 w-fit">
          <Icon size={12} />
          {currentType.label}
        </div>
      )}
    </div>
  )
}
