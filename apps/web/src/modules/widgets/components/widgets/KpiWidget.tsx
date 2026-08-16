import React, { useEffect, useState } from 'react'
import { WidgetProps } from '../../types'
import { TrendingUp, TrendingDown } from 'lucide-react'

const KpiWidget: React.FC<WidgetProps> = ({ config, data }) => {
  const [value, setValue] = useState<number>(0)
  const [trend, setTrend] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setValue(Math.floor(Math.random() * 100000))
      setTrend(Math.floor(Math.random() * 100) - 50)
      setLoading(false)
    }, 500)
  }, [])

  const isPositive = trend >= 0

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-4xl font-bold text-text-1">
        ${value.toLocaleString()}
      </div>
      <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{Math.abs(trend)}%</span>
      </div>
      <p className="text-text-3 text-xs mt-3">
        vs. previous {config.config?.period || 'month'}
      </p>
    </div>
  )
}

export default KpiWidget
