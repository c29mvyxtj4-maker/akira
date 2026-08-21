import { useId } from 'react'

/*
 * Gráfica de área transparente (SVG puro, sin dependencias) para la pantalla de
 * inicio. Dibuja dos series (ingresos / gastos) sobre fondo transparente, con
 * relleno en degradado a baja opacidad. Responsive vía viewBox.
 */
function buildPath(values, max, w, h, pad) {
  var n = values.length
  if (n === 0) return { line: '', area: '' }
  var innerW = w - pad * 2
  var innerH = h - pad * 2
  var stepX = n > 1 ? innerW / (n - 1) : 0
  var pts = values.map(function (v, i) {
    var x = pad + i * stepX
    var y = pad + innerH - (max > 0 ? (v / max) * innerH : 0)
    return [x, y]
  })
  var line = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join(' ')
  var area = line + ' L' + (pad + (n - 1) * stepX).toFixed(1) + ' ' + (h - pad).toFixed(1) + ' L' + pad.toFixed(1) + ' ' + (h - pad).toFixed(1) + ' Z'
  return { line: line, area: area }
}

export default function TransparentArea({ data, height = 150 }) {
  var uid = useId().replace(/:/g, '')
  var rows = Array.isArray(data) ? data : []
  var w = 560
  var h = height
  var pad = 14
  var max = rows.reduce(function (m, r) { return Math.max(m, Number(r.income) || 0, Number(r.expense) || 0) }, 0) || 1

  var income = buildPath(rows.map(function (r) { return Number(r.income) || 0 }), max, w, h, pad)
  var expense = buildPath(rows.map(function (r) { return Number(r.expense) || 0 }), max, w, h, pad)

  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} preserveAspectRatio="none" style={{ width: '100%', height: height + 'px', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={'inc' + uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={'exp' + uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gastos (detrás) */}
      <path d={expense.area} fill={'url(#exp' + uid + ')'} />
      <path d={expense.line} fill="none" stroke="#64748b" strokeOpacity="0.6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {/* Ingresos (delante) */}
      <path d={income.area} fill={'url(#inc' + uid + ')'} />
      <path d={income.line} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
