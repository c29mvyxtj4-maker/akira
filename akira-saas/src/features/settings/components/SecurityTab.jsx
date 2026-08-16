import { useState } from 'react'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { updatePassword } from '@/services/settings.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function SecurityTab() {
  var [form,    setForm]    = useState({ newPassword: '', confirmPassword: '' })
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)
  var [showNew, setShowNew] = useState(false)
  var [showCfm, setShowCfm] = useState(false)
  var [error,   setError]   = useState('')

  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }); setError('') } }

  function handleSave() {
    setError('')
    if (!form.newPassword || form.newPassword.length < 8) { setError('La contrasena debe tener al menos 8 caracteres'); return }
    if (form.newPassword !== form.confirmPassword) { setError('Las contrasenas no coinciden'); return }
    setSaving(true)
    updatePassword(form.newPassword)
      .then(function() { setSaved(true); setForm({ newPassword: '', confirmPassword: '' }); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setSaving(false) })
  }

  return (
    <div>
      <Section title="Cambiar contrasena" description="Usa una contrasena segura de al menos 8 caracteres">
        <Field label="Nueva contrasena">
          <div style={{ position: 'relative' }}>
            <input type={showNew ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')} placeholder="Nueva contrasena" style={Object.assign({}, INP, { paddingRight: '40px' })} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={function() { setShowNew(function(v) { return !v }) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center' }}
            >
              {showNew ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
            </button>
          </div>
        </Field>
        <Field label="Confirmar contrasena">
          <div style={{ position: 'relative' }}>
            <input type={showCfm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repite la contrasena" style={Object.assign({}, INP, { paddingRight: '40px' })} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={function() { setShowCfm(function(v) { return !v }) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center' }}
            >
              {showCfm ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
            </button>
          </div>
        </Field>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '13px', color: '#e63946' }}>
            <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
            {error}
          </div>
        )}
      </Section>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}


export default SecurityTab
