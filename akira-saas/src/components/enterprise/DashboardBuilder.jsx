import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Dashboard Builder
 * Drag-and-drop dashboard widget configuration
 */
export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState([
    { id: 'w1', title: 'Revenue', type: 'chart', size: 'lg', enabled: true },
    { id: 'w2', title: 'Clients', type: 'metric', size: 'sm', enabled: true },
    { id: 'w3', title: 'Projects', type: 'metric', size: 'sm', enabled: true },
    { id: 'w4', title: 'Activities', type: 'list', size: 'md', enabled: true },
  ])

  const [selectedWidget, setSelectedWidget] = useState(null)

  const AVAILABLE_WIDGETS = [
    { id: 'revenue-chart', name: 'Revenue Chart', category: 'Finance' },
    { id: 'client-list', name: 'Client List', category: 'CRM' },
    { id: 'project-timeline', name: 'Project Timeline', category: 'Projects' },
    { id: 'activity-feed', name: 'Activity Feed', category: 'General' },
    { id: 'team-members', name: 'Team Members', category: 'Team' },
    { id: 'invoices-due', name: 'Invoices Due', category: 'Finance' },
    { id: 'time-tracking', name: 'Time Tracking', category: 'Time' },
    { id: 'upcoming-events', name: 'Upcoming Events', category: 'Calendar' },
  ]

  const toggleWidget = (widgetId) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ))
  }

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const addWidget = (widgetId) => {
    const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId)
    if (!widget) return

    const newWidget = {
      id: `w${Date.now()}`,
      title: widget.name,
      type: 'chart',
      size: 'md',
      enabled: true,
    }
    setWidgets([...widgets, newWidget])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">Dashboard Builder</h2>
        <p className="text-sm text-text-4 mt-1">Customize your dashboard with widgets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Widgets */}
        <div className="space-y-4">
          <h3 className="font-semibold text-text-1 flex items-center gap-2">
            <Plus size={18} />
            Add Widgets
          </h3>

          {/* Group by Category */}
          {['Finance', 'CRM', 'Projects', 'Team', 'Time', 'Calendar', 'General'].map(category => {
            const categoryWidgets = AVAILABLE_WIDGETS.filter(w => w.category === category)
            if (categoryWidgets.length === 0) return null

            return (
              <div key={category}>
                <h4 className="text-xs font-semibold text-text-4 uppercase mb-2">{category}</h4>
                <div className="space-y-2">
                  {categoryWidgets.map(widget => (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-text-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-lg transition-colors flex items-center justify-between group"
                    >
                      {widget.name}
                      <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Dashboard Preview */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2">
              <LayoutGrid size={18} />
              Dashboard Layout
            </h3>

            <div className="space-y-4">
              {widgets.length === 0 ? (
                <div className="bg-surface-3 rounded-lg p-8 text-center">
                  <p className="text-text-4 text-sm">No widgets added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {widgets.map((widget, i) => (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedWidget(widget.id)}
                      className={`relative group p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedWidget === widget.id
                          ? 'bg-surface-3 border-brand-500 ring-1 ring-brand-500/30'
                          : 'bg-surface-2 border-border hover:border-brand-500/50'
                      } ${!widget.enabled ? 'opacity-50' : ''}`}
                    >
                      {/* Widget Placeholder */}
                      <div className="aspect-video bg-surface-1 rounded mb-2 flex items-center justify-center">
                        <span className="text-text-4 text-sm opacity-50">{widget.type}</span>
                      </div>

                      <h4 className="font-medium text-text-1 text-sm mb-2">{widget.title}</h4>

                      {/* Controls */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWidget(widget.id)
                          }}
                          className="p-1 hover:bg-surface-3 rounded text-text-4 hover:text-text-2 transition-colors"
                        >
                          {widget.enabled ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeWidget(widget.id)
                          }}
                          className="p-1 hover:bg-surface-3 rounded text-text-4 hover:text-status-danger transition-colors ml-auto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex gap-3">
              <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium text-sm">
                Save Layout
              </button>
              <button className="px-6 py-2 bg-surface-3 text-text-2 rounded-lg hover:bg-surface-4 transition-colors font-medium text-sm">
                Reset to Default
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
