var SIZES = {
  xs:  { wh: '24px', fs: '9px' },
  sm:  { wh: '28px', fs: '10px' },
  md:  { wh: '32px', fs: '12px' },
  lg:  { wh: '40px', fs: '14px' },
  xl:  { wh: '48px', fs: '16px' },
  '2xl': { wh: '64px', fs: '22px' },
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(function(n) { return n[0] }).slice(0, 2).join('').toUpperCase()
}

function hashColor(str) {
  var GRADIENTS = [
    'linear-gradient(135deg, #e63946, #cc2936)',
    'linear-gradient(135deg, #a855f7, #7c3aed)',
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #22c55e, #15803d)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ec4899, #be185d)',
  ]
  var hash = 0
  for (var i = 0; i < (str || '').length; i++) {
    hash = (str || '').charCodeAt(i) + ((hash << 5) - hash)
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function Avatar({ name, src, size = 'md', className }) {
  var s = SIZES[size] || SIZES.md

  if (src) {
    return (
      <img src={src} alt={name || 'Avatar'}
        style={{ width: s.wh, height: s.wh, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
        className={className}
      />
    )
  }

  return (
    <div style={{
      width: s.wh, height: s.wh, borderRadius: '50%',
      background: hashColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: s.fs, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.02em',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }} className={className}>
      {getInitials(name)}
    </div>
  )
}