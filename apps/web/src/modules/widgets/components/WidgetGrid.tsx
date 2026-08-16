import React, { useState } from 'react'
import { DashboardConfig, WidgetConfig } from '../types'
import Widget from './Widget'
import WidgetEditor from './WidgetEditor'
import { motion, AnimatePresence } from 'framer-motion'

interface WidgetGridProps {
  dashboard: DashboardConfig | null
  onUpdateDashboard: (config: Partial<DashboardConfig>) => Promise<void>
  onAddWidget: (widget: WidgetConfig) => Promise<void>
  onRemoveWidget: (id: string) => Promise<void>
  onReorderWidgets: (widgets: WidgetConfig[]) => Promise<void>
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  dashboard,
  onUpdateDashboard,
  onAddWidget,
  onRemoveWidget,
  onReorderWidgets,
}) => {
  const [showEditor, setShowEditor] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-3 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (!draggedWidget || !dashboard.widgets) return

    const sourceIndex = dashboard.widgets.findIndex((w) => w.id === draggedWidget)
    if (sourceIndex === -1) return

    const newWidgets = [...dashboard.widgets]
    const [widget] = newWidgets.splice(sourceIndex, 1)
    newWidgets.splice(targetIndex, 0, widget)

    onReorderWidgets(newWidgets)
    setDraggedWidget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-1">{dashboard.name}</h2>
          <p className="text-text-3 text-sm mt-1">
            {dashboard.widgets?.length || 0} widgets
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          + Add Widget
        </button>
      </div>

      {/* Widget Editor Modal */}
      {showEditor && (
        <WidgetEditor
          onAddWidget={async (widget) => {
            await onAddWidget(widget)
            setShowEditor(false)
          }}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Widgets Grid */}
      <div className={`grid gap-4 grid-cols-${dashboard.gridCols || 4}`}>
        <AnimatePresence>
          {dashboard.widgets && dashboard.widgets.length > 0 ? (
            dashboard.widgets.map((widget, index) => (
              <motion.div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={draggedWidget === widget.id ? 'opacity-50' : ''}
              >
                <Widget
                  config={widget}
                  onRemove={onRemoveWidget}
                  onUpdate={(updated) =>
                    onUpdateDashboard({
                      widgets: dashboard.widgets?.map((w) =>
                        w.id === widget.id ? updated : w
                      ),
                    })
                  }
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-64 bg-surface-1 rounded-lg border-2 border-dashed border-surface-2">
              <div className="text-center">
                <p className="text-text-3 text-sm">No widgets yet</p>
                <button
                  onClick={() => setShowEditor(true)}
                  className="mt-3 text-brand-500 hover:text-brand-600 text-sm font-medium"
                >
                  Add your first widget →
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default WidgetGrid
