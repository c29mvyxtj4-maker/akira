import React from 'react'
import { WidgetProps } from '../../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const RevenueChartWidget: React.FC<WidgetProps> = ({ config }) => {
  const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
        <XAxis dataKey="name" stroke="var(--text-3)" />
        <YAxis stroke="var(--text-3)" />
        <Tooltip />
        <Bar dataKey="value" fill="var(--brand-500)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueChartWidget
