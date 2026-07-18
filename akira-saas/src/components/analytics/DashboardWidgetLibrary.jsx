import { motion } from 'framer-motion'
import { Plus, Grid3x3, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import { useState } from 'react'

const WIDGET_TEMPLATES = [
  {
    id: 'revenue_trend',
    name: 'Revenue Trend',
    description: 'Monthly revenue with growth rate',
    icon: LineChartIcon,
    color: '#22c55e',
  },
  {
    id: 'customer_segmentation',
    name: 'Customer Segmentation',
    description: 'Breakdown by customer segment',
    icon: PieChartIcon,
    color: '#3b82f6',
  },
  {
    id: 'churn_forecast',
    name: 'Churn Forecast',
    description: '3-month churn predictions',
    icon: LineChartIcon,
    color: '#ef4444',
  },
  {
    id: 'cash_flow',
    name: 'Cash Flow',
    description: 'Inflow vs outflow analysis',
    icon: BarChart3,
    color: '#f59e0b',
  },
  {
    id: 'product_metrics',
    name: 'Product Metrics',
    description: 'Usage, engagement, activation',
    icon: BarChart3,
    color: '#a855f7',
  },
  {
    id: 'team_performance',
    name: 'Team Performance',
    description: 'Productivity and efficiency scores',
    icon: LineChartIcon,
    color: '#06b6d4',
  },
  {
    id: 'market_share',
    name: 'Market Share',
    description: 'Competitive positioning',
    icon: PieChartIcon,
    color: '#ec4899',
  },
  {
    id: 'risk_dashboard',
    name: 'Risk Dashboard',
    description: 'Key risk indicators',
    icon: BarChart3,
    color: '#ef4444',
  },
]

export default function DashboardWidgetLibrary() {
  const [selectedWidgets, setSelectedWidgets] = useState([])
  const [showPreview, setShowPreview] = useState(null)

  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    )
  }

  const addAllWidgets = () => {
    setSelectedWidgets(WIDGET_TEMPLATES.map(w => w.id))
  }

  const clearWidgets = () => {
    setSelectedWidgets([])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-1 font-bold text-lg">Widget Library</h3>
          <p className="text-text-4 text-sm">Select widgets to add to your dashboard</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearWidgets}
            className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-2 hover:border-brand-500/30 transition-all text-sm font-medium"
          >
            Clear
          </button>
          <button
            onClick={addAllWidgets}
            className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-2 hover:border-brand-500/30 transition-all text-sm font-medium"
          >
            Add All
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-all text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply ({selectedWidgets.length})
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WIDGET_TEMPLATES.map((widget, idx) => {
          const Icon = widget.icon
          const isSelected = selectedWidgets.includes(widget.id)

          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleWidget(widget.id)}
              onHoverStart={() => setShowPreview(widget.id)}
              onHoverEnd={() => setShowPreview(null)}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                isSelected
                  ? 'bg-surface-2 border-brand-500 shadow-lg shadow-brand-500/20'
                  : 'bg-surface-3 border-border hover:border-brand-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${widget.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: widget.color }} />
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                )}
              </div>
              <h4 className="text-text-1 font-semibold text-sm mb-1">{widget.name}</h4>
              <p className="text-text-4 text-xs">{widget.description}</p>

              {showPreview === widget.id && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 pt-3 border-t border-border text-xs text-text-4"
                >
                  Click to {isSelected ? 'remove' : 'add'}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Selected Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-surface-2 border border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-2 font-semibold">{selectedWidgets.length} widgets selected</p>
            <p className="text-text-4 text-sm">
              {selectedWidgets.length === 0
                ? 'No widgets selected yet'
                : `${selectedWidgets.length} of ${WIDGET_TEMPLATES.length} available`}
            </p>
          </div>
          <Grid3x3 className="w-6 h-6 text-text-3" />
        </div>
      </motion.div>

      {/* Preview */}
      {selectedWidgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-surface-2 border border-border"
        >
          <h4 className="text-text-1 font-semibold mb-3">Selected Widgets</h4>
          <div className="flex flex-wrap gap-2">
            {selectedWidgets.map(widgetId => {
              const widget = WIDGET_TEMPLATES.find(w => w.id === widgetId)
              return (
                <div
                  key={widgetId}
                  className="px-3 py-1 rounded-lg bg-surface-3 border border-border text-text-2 text-sm flex items-center gap-2"
                >
                  {widget.name}
                  <button
                    onClick={() => toggleWidget(widgetId)}
                    className="ml-1 hover:text-text-1"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
