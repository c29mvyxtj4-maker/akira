export default function Input({ label, error, hint, icon, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label className="label-base">{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          className="input-base"
          style={icon ? { paddingLeft: '32px' } : {}}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '11px', color: 'var(--brand)' }}>{error}</span>}
      {hint  && <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>{hint}</span>}
    </div>
  )
}