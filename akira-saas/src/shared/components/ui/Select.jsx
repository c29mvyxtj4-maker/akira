export default function Select({ label, options = [], error, size, className, ...props }) {
  var PAD = size === 'sm' ? '5px 10px' : '7px 12px'
  var FSZ = size === 'sm' ? '12px' : '13px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label className="label-base">{label}</label>}
      <select
        className={'input-base ' + (className || '')}
        style={{ padding: PAD, fontSize: FSZ, cursor: 'pointer', appearance: 'auto' }}
        {...props}
      >
        {options.map(function(o) {
          return <option key={o.value} value={o.value}>{o.label}</option>
        })}
      </select>
      {error && <span style={{ fontSize: '11px', color: 'var(--brand)' }}>{error}</span>}
    </div>
  )
}