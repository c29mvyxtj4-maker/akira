import React from 'react'
import { WidgetProps } from '../../types'
import { Activity, CheckCircle2, FileText, Users, TrendingUp } from 'lucide-react'

const ActivityFeedWidget: React.FC<WidgetProps> = () => {
  const activities = [
    { id: 1, type: 'complete', title: 'Task completed', desc: 'Dashboard redesign finished', time: '1h ago', icon: CheckCircle2 },
    { id: 2, type: 'invoice', title: 'Invoice created', desc: 'Invoice #INV-045 for Acme Corp', time: '3h ago', icon: FileText },
    { id: 3, type: 'client', title: 'New client added', desc: 'Tech Startup joined', time: '5h ago', icon: Users },
    { id: 4, type: 'revenue', title: 'Payment received', desc: '$5,000 from Design Studio', time: '1d ago', icon: TrendingUp },
  ]

  const iconColors: Record<string, string> = {
    complete: 'text-success',
    invoice: 'text-brand-500',
    client: 'text-info',
    revenue: 'text-success',
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon
        return (
          <div key={activity.id} className="flex gap-3 pb-3 border-b border-surface-2 last:border-0">
            <div className="mt-1 flex-shrink-0">
              <Icon size={16} className={iconColors[activity.type]} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-1">{activity.title}</p>
              <p className="text-xs text-text-3 mt-0.5">{activity.desc}</p>
              <p className="text-xs text-text-4 mt-1">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityFeedWidget
