import React from 'react'
import { WidgetProps } from '../../types'
import { CheckCircle2, Circle } from 'lucide-react'

const TasksOverviewWidget: React.FC<WidgetProps> = () => {
  const stats = {
    total: 24,
    completed: 16,
    pending: 8,
  }

  const percentage = Math.round((stats.completed / stats.total) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <p className="text-text-3 text-xs mb-1">Tasks Completed</p>
          <p className="text-3xl font-bold text-text-1">{stats.completed}</p>
          <p className="text-text-4 text-xs mt-1">of {stats.total}</p>
        </div>
        <div className="flex-1">
          <div className="w-full h-2 bg-surface-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-text-3 text-xs mt-2">{percentage}% complete</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-success/10 rounded-lg">
          <p className="text-text-4 text-xs mb-1">Completed</p>
          <p className="text-lg font-semibold text-success">{stats.completed}</p>
        </div>
        <div className="p-3 bg-warning/10 rounded-lg">
          <p className="text-text-4 text-xs mb-1">Pending</p>
          <p className="text-lg font-semibold text-warning">{stats.pending}</p>
        </div>
      </div>
    </div>
  )
}

export default TasksOverviewWidget
