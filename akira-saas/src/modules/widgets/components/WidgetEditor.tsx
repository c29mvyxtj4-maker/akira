import React, { useState } from 'react'
import { WidgetConfig } from '../types'
import { widgetRegistry } from '../WidgetRegistry'
import { motion } from 'framer-motion'

interface WidgetEditorProps {
  onAddWidget: (widget: WidgetConfig) => Promise<void>
  onClose: () => void
}

export const WidgetEditor: React.FC<WidgetEditorProps> = ({
  onAddWidget,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full'>('md')
  const [loading, setLoading] = useState(false)

  const widgets = widgetRegistry.getAll()

  const handleAdd = async () => {
    if (!selectedType || !title) return

    const definition = widgetRegistry.get(selectedType as any)
    if (!definition) return

    try {
      setLoading(true)
      const widget: WidgetConfig = {
        id: `widget-${Date.now()}`,
        type: selectedType as any,
        title,
        size,
        position: 0,
        config: definition.defaultConfig,
      }
      await onAddWidget(widget)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-surface-0 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-0 border-b border-surface-2 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-1">Add Widget</h2>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-text-1 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Widget Selection */}
          <div>
            <label className="block text-sm font-medium text-text-1 mb-3">
              Select Widget Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {widgets.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => {
                    setSelectedType(widget.type)
                    setTitle(widget.title)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedType === widget.type
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-2 bg-surface-1 hover:border-surface-3'
                  }`}
                >
                  <p className="font-medium text-text-1 text-sm">{widget.title}</p>
                  <p className="text-text-4 text-xs mt-1">{widget.description}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-1 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-2 rounded-lg bg-surface-1 text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter widget title"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-text-1 mb-2">
                  Size
                </label>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'full'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm font-medium capitalize ${
                        size === s
                          ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                          : 'border-surface-2 bg-surface-1 text-text-2 hover:border-surface-3'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-surface-0 border-t border-surface-2 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-surface-2 rounded-lg hover:bg-surface-1 transition-colors text-text-1 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedType || !title || loading}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? 'Adding...' : 'Add Widget'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WidgetEditor
