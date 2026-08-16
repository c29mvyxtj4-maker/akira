import { Save, Check } from 'lucide-react'

/* Utilidades y componentes compartidos por las pestañas de Settings. */

export const INP = {
  background:  'var(--bg-3)',
  border:      '1px solid var(--border)',
  color:       'var(--text-1)',
  borderRadius: '8px',
  fontSize:    '13px',
  padding:     '9px 12px',
  outline:     'none',
  fontFamily:  'inherit',
  width:       '100%',
  boxSizing:   'border-box',
  transition:  'border-color 0.15s',
}

export function onFocus(e)  { e.target.style.borderColor = 'var(--brand)' }
export function onBlur(e)   { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }

export function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

export function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>
        {description && <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '4px' }}>{description}</p>}
      </div>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

export function SaveBtn({ loading, saved, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      onMouseEnter={function (e) { if (!loading && !saved) e.currentTarget.style.boxShadow = '0 4px 16px rgba(230,57,70,0.45), 0 0 22px 2px rgba(230,57,70,0.38)' }}
      onMouseLeave={function (e) { e.currentTarget.style.boxShadow = saved ? 'none' : '0 2px 8px rgba(230,57,70,0.3)' }}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: saved ? '#22c55e' : 'var(--gradient-brand)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: saved ? 'none' : '0 2px 8px rgba(230,57,70,0.3)', transition: 'all 0.2s' }}
    >
      {saved
        ? <><Check style={{ width: '14px', height: '14px' }} /> Guardado</>
        : loading ? 'Guardando...'
        : <><Save style={{ width: '14px', height: '14px' }} /> Guardar</>
      }
    </button>
  )
}

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, background: toast.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(34,197,94,0.1)', color: toast.type === 'error' ? '#e63946' : '#22c55e', border: '1px solid ' + (toast.type === 'error' ? 'rgba(230,57,70,0.25)' : 'rgba(34,197,94,0.25)') }}>
      {toast.msg}
    </div>
  )
}

/* ── Primitivas estilo Notion: fila título+descripción con control a la derecha ── */

// Interruptor reutilizable (antes vivía duplicado en cada tab).
export function Toggle({ checked, onClick, disabled }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled}
      aria-pressed={!!checked}
      style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', border: 'none', background: checked ? 'var(--brand)' : '#374151', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s', flexShrink: 0, opacity: disabled ? 0.45 : 1 }}
    >
      <span style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  )
}

// Fila de ajuste: texto a la izquierda, control (children) a la derecha.
export function Row({ title, description, children, last, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title}
          {badge && <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-4)', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '999px', padding: '1px 7px' }}>{badge}</span>}
        </p>
        {description && <p style={{ fontSize: '11.5px', color: 'var(--text-4)', marginTop: '3px', lineHeight: 1.45, maxWidth: '440px' }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>
    </div>
  )
}

// Contenedor de tarjeta con un encabezado de sección opcional (sin gap fijo,
// las filas gestionan su propio padding/divisor).
export function RowSection({ title, description, children }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      {(title || description) && (
        <div style={{ marginBottom: '10px' }}>
          {title && <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>}
          {description && <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '4px' }}>{description}</p>}
        </div>
      )}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px 18px' }}>
        {children}
      </div>
    </div>
  )
}

// Botón compacto para el lado derecho de una fila.
export function MiniBtn({ label, onClick, disabled, danger, icon: Icon }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid ' + (danger ? 'var(--brand-border)' : 'var(--border)'), background: danger ? 'var(--brand-dim)' : 'var(--bg-3)', color: danger ? 'var(--brand)' : 'var(--text-2)', fontSize: '12.5px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap' }}>
      {Icon && <Icon style={{ width: '14px', height: '14px' }} />}{label}
    </button>
  )
}

// Etiqueta de atajo de teclado (p. ej. Ctrl + K).
export function Kbd({ children }) {
  return <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 8px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{children}</span>
}

// Select compacto para el lado derecho de una fila.
export function RowSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
      {options.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option> })}
    </select>
  )
}
