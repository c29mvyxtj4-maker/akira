import React from 'react'
import { WidgetProps } from '../../types'
import { Clock, DollarSign } from 'lucide-react'

const TimeSummaryWidget: React.FC<WidgetProps> = () => {
  const stats = {
    billable: 34.5,
    nonBillable: 8.5,
    rate: 150,
  }

  const billableValue = stats.billable * stats.rate

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-brand-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-brand-500" />
            <p className="text-text-4 text-xs">Billable</p>
          </div>
          <p className="text-lg font-semibold text-brand-500">{stats.billable}h</p>
        </div>
        <div className="p-3 bg-text-3/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-text-3" />
            <p className="text-text-4 text-xs">Non-billable</p>
          </div>
          <p className="text-lg font-semibold text-text-3">{stats.nonBillable}h</p>
        </div>
      </div>

      <div className="p-3 bg-success/10 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={14} className="text-success" />
          <p className="text-text-4 text-xs">Billable Value</p>
        </div>
        <p className="text-2xl font-bold text-success">${billableValue.toLocaleString()}</p>
      </div>
    </div>
  )
}

export default TimeSummaryWidget
