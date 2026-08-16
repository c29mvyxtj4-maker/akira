import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-4 border border-border rounded-lg px-3 py-2 shadow-modal">
      <p className="text-text-3 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.fill || p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function BarChart({
  data     = [],
  bars     = [{ key: 'value', color: '#6366f1', name: 'Valor' }],
  height   = 200,
  xKey     = 'name',
  showGrid = true,
  showAxes = true,
  radius   = 4,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        )}
        {showAxes && (
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
        )}
        {showAxes && (
          <YAxis
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name} radius={[radius, radius, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || b.color} fillOpacity={0.9} />
            ))}
          </Bar>
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}