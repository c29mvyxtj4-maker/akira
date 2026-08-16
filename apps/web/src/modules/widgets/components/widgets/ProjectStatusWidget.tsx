import React from 'react'
import { WidgetProps } from '../../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const ProjectStatusWidget: React.FC<WidgetProps> = () => {
  const data = [
    { name: 'Active', value: 12, fill: 'var(--brand-500)' },
    { name: 'Completed', value: 8, fill: 'var(--success)' },
    { name: 'Pending', value: 5, fill: 'var(--warning)' },
    { name: 'Cancelled', value: 2, fill: 'var(--danger)' },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ProjectStatusWidget
