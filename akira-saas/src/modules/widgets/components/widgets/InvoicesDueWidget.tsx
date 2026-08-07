import React from 'react'
import { WidgetProps } from '../../types'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const InvoicesDueWidget: React.FC<WidgetProps> = () => {
  const invoices = [
    { id: 'INV-001', client: 'Acme Corp', amount: 5000, dueDate: '2026-08-15', status: 'overdue' },
    { id: 'INV-002', client: 'Tech Startup', amount: 3500, dueDate: '2026-08-20', status: 'due-soon' },
    { id: 'INV-003', client: 'Design Studio', amount: 2200, dueDate: '2026-08-25', status: 'due-soon' },
  ]

  return (
    <div className="space-y-2">
      {invoices.map((inv) => (
        <div key={inv.id} className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-1">{inv.id}</p>
            <p className="text-xs text-text-3">{inv.client}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text-1">${inv.amount.toLocaleString()}</p>
            <p className={`text-xs ${inv.status === 'overdue' ? 'text-danger' : 'text-warning'}`}>
              {inv.status === 'overdue' ? 'Overdue' : 'Due soon'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default InvoicesDueWidget
