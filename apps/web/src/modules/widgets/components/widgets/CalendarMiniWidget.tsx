import React from 'react'
import { WidgetProps } from '../../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CalendarMiniWidget: React.FC<WidgetProps> = () => {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-1">
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-surface-1 rounded">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1 hover:bg-surface-1 rounded">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs text-text-3 py-2 font-medium">
            {day}
          </div>
        ))}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`text-center text-xs py-2 rounded ${
              day === today.getDate()
                ? 'bg-brand-500 text-white font-semibold'
                : day
                ? 'text-text-2 hover:bg-surface-1'
                : 'text-text-4'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarMiniWidget
