import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '@/services/settings.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function ProfileTab({ user }) {
  var [profile, setProfile] = useState({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getProfile()
      .then(function(data) { setProfile(Object.assign({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '' }, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function set(k) { return function(e) { setProfile(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  function handleSave() {
    setSaving(true)
    updateProfile(profile)
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Informacion personal" description="Tu nombre e informacion de contacto visible en AKIRA">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Nombre completo">
            <input value={profile.full_name || ''} onChange={set('full_name')} placeholder="Tu nombre" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Empresa">
            <input value={profile.company || ''} onChange={set('company')} placeholder="Nombre de tu empresa" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Rol / Cargo">
            <input value={profile.role || ''} onChange={set('role')} placeholder="Ej: Director Creativo" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Telefono">
            <input value={profile.phone || ''} onChange={set('phone')} placeholder="+34 600 000 000" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Sitio web">
            <input value={profile.website || ''} onChange={set('website')} placeholder="https://tuwebsite.com" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Ubicacion">
            <input value={profile.location || ''} onChange={set('location')} placeholder="Madrid, España" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        <Field label="Bio" hint="Una descripcion breve sobre ti o tu negocio">
          <textarea value={profile.bio || ''} onChange={set('bio')} placeholder="Cuentanos sobre ti..." rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </Section>

      <Section title="Cuenta" description="Tu email de acceso a AKIRA">
        <Field label="Email" hint="El email no se puede cambiar desde aqui">
          <input value={user ? user.email : ''} disabled style={Object.assign({}, INP, { opacity: 0.5, cursor: 'not-allowed' })} />
        </Field>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}


export default ProfileTab
