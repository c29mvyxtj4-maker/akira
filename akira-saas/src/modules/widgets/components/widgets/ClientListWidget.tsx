import React from 'react'
import { WidgetProps } from '../../types'
import { Users } from 'lucide-react'

const ClientListWidget: React.FC<WidgetProps> = () => {
  const clients = [
    { id: 1, name: 'Acme Corp', revenue: 45000, status: 'active' },
    { id: 2, name: 'Tech Startup', revenue: 38000, status: 'active' },
    { id: 3, name: 'Design Studio', revenue: 25000, status: 'active' },
    { id: 4, name: 'Finance Co', revenue: 19000, status: 'active' },
    { id: 5, name: 'Media Group', revenue: 15000, status: 'paused' },
  ]

  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
              <Users size={16} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-1">{client.name}</p>
              <p className="text-xs text-text-3">${client.revenue.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-success/10 text-success rounded">Active</span>
        </div>
      ))}
    </div>
  )
}

export default ClientListWidget
