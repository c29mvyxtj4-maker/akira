import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-surface-4 border border-border rounded-lg px-3 py-2 shadow-modal">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
        <span className="text-text-2 text-xs">{d.name}</span>
      </div>
      <p className="text-sm font-bold text-text-1 mt-0.5">{d.value}</p>
    </div>
  )
}

export default function DonutChart({
  data        = [],
  height      = 160,
  innerRadius = 45,
  outerRadius = 70,
  centerLabel,
  centerValue,
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centro */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-xl font-black text-text-1 leading-none">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-2xs text-text-4 mt-1 uppercase tracking-wider">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}