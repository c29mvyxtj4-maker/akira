import { motion } from 'framer-motion'
import { Trash2, Maximize2 } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'

export default function DashboardWidget({
  widget,
  onRemove,
  onResize,
  isDragging = false,
}) {
  if (!widget) return null

  const widgetTypeConfig = {
    kpi: { bgColor: 'bg-blue-50', height: 'h-32' },
    'chart-revenue': { bgColor: 'bg-green-50', height: 'h-64' },
    'chart-projects': { bgColor: 'bg-purple-50', height: 'h-64' },
    'activity-feed': { bgColor: 'bg-orange-50', height: 'h-80' },
    'upcoming-events': { bgColor: 'bg-pink-50', height: 'h-48' },
    forecast: { bgColor: 'bg-indigo-50', height: 'h-48' },
    'quick-actions': { bgColor: 'bg-yellow-50', height: 'h-40' },
    metrics: { bgColor: 'bg-teal-50', height: 'h-64' },
  }

  const config = widgetTypeConfig[widget.id] || {
    bgColor: 'bg-gray-50',
    height: 'h-48',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative ${config.bgColor} ${config.height} rounded-lg border border-gray-200
        p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      whileHover={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{widget.name}</h3>
        <div className="flex gap-1">
          <IconButton
            icon="Maximize2"
            onClick={() => onResize?.(widget.id)}
            title="Resize"
            aria-label={`Resize ${widget.name}`}
            size="sm"
          />
          <IconButton
            icon="Trash2"
            onClick={() => onRemove?.(widget.id)}
            title="Remove"
            aria-label={`Remove ${widget.name}`}
            size="sm"
            className="text-red-600 hover:bg-red-50"
          />
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
        {widget.icon} {widget.id}
      </div>
    </motion.div>
  )
}
