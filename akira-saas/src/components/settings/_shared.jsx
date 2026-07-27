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
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: saved ? '#22c55e' : 'var(--gradient-brand)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
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
