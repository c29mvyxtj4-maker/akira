export default function Spinner({ size = 20, color }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke={color || 'var(--brand)'}
      strokeWidth="2.5"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  )
}

export function PageSpinner({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', flex: 1 }}>
      <Spinner size={28} />
      {label && <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>{label}</p>}
    </div>
  )
}