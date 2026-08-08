import React from 'react'
import { WidgetProps } from '../../types'
import { MessageSquare, User } from 'lucide-react'

const MessagesFeedWidget: React.FC<WidgetProps> = () => {
  const messages = [
    { id: 1, author: 'John Doe', text: 'Project update: Dashboard is 80% complete', time: '2 hours ago' },
    { id: 2, author: 'Jane Smith', text: 'Client meeting scheduled for tomorrow', time: '4 hours ago' },
    { id: 3, author: 'Mike Johnson', text: 'Invoice #INV-042 has been paid', time: '6 hours ago' },
  ]

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-3 pb-3 border-b border-surface-2 last:border-0">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-1">{msg.author}</p>
            <p className="text-xs text-text-3 mt-1 line-clamp-2">{msg.text}</p>
            <p className="text-xs text-text-4 mt-1">{msg.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessagesFeedWidget
