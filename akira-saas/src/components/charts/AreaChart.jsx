import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-4 border border-border rounded-lg px-3 py-2 shadow-modal">
      <p className="text-text-3 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

export default function AreaChart({
  data       = [],
  lines      = [{ key: 'value', color: '#6366f1', name: 'Valor' }],
  height     = 200,
  xKey       = 'name',
  formatter,
  showGrid   = true,
  showAxes   = true,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {lines.map(l => (
          <Area
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2}
            fill={l.color}
            fillOpacity={0.12}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: l.color }}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  )
}