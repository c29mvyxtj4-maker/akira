import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

export default function MiniSparkline({
  data    = [],
  dataKey = 'value',
  color   = '#6366f1',
  height  = 40,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Tooltip
          contentStyle={{ display: 'none' }}
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}