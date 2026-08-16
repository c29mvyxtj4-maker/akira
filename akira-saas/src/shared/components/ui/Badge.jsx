import clsx from 'clsx'

var COLOR_CLASS = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger:  'badge badge-danger',
  error:   'badge badge-danger',
  info:    'badge badge-info',
  default: 'badge badge-default',
  purple:  'badge badge-purple',
  brand:   'badge badge-brand',
}

var SIZE_STYLE = {
  xs: { fontSize: '9px',  padding: '1px 6px',  letterSpacing: '0.04em' },
  sm: { fontSize: '10px', padding: '2px 7px',  letterSpacing: '0.03em' },
  md: { fontSize: '11px', padding: '2px 8px',  letterSpacing: '0.02em' },
}

export default function Badge({ children, color = 'default', size = 'sm', dot }) {
  var cls   = COLOR_CLASS[color] || COLOR_CLASS.default
  var sStyle = SIZE_STYLE[size]  || SIZE_STYLE.sm

  return (
    <span className={cls} style={sStyle}>
      {dot && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
      )}
      {children}
    </span>
  )
}