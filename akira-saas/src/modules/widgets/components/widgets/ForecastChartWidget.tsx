import React from 'react'
import { WidgetProps } from '../../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ForecastChartWidget: React.FC<WidgetProps> = () => {
  const data = [
    { name: 'Jul', actual: 4000, forecast: 4200 },
    { name: 'Aug', actual: 3000, forecast: 3800 },
    { name: 'Sep', actual: null, forecast: 4500 },
    { name: 'Oct', actual: null, forecast: 5000 },
    { name: 'Nov', actual: null, forecast: 5200 },
    { name: 'Dec', actual: null, forecast: 6000 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
        <XAxis dataKey="name" stroke="var(--text-3)" />
        <YAxis stroke="var(--text-3)" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="var(--brand-500)"
          strokeWidth={2}
          name="Actual"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="var(--info)"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Forecast"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ForecastChartWidget
