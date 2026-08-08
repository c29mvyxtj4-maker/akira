import { useEffect, useState, useRef } from 'react'
import { Copy, Check, Upload } from 'lucide-react'
import { getProfile, updateProfile } from '@/services/settings.service'
import { supabase } from '@/lib/supabase'
import { usePrefs } from '@/hooks/usePreferences'
import { Field, INP, SaveBtn, Section, RowSection, Row, Toggle, MiniBtn, onBlur, onFocus } from './_shared'

/*
 * Mi perfil (grupo Cuenta) — datos personales + foto, seguridad de la cuenta,
 * soporte, dispositivos e ID de usuario. Cada acción lleva su descripción.
 */
function ProfileTab({ user }) {
  var [copied, setCopied] = useState(false)
  var [pwSent, setPwSent] = useState(false)
  var [uploading, setUploading] = useState(false)
  var fileRef = useRef(null)
  var [prefs, setPref] = usePrefs({ support_access: false })

  var [profile, setProfile] = useState({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '', avatar_url: '' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getProfile()
      .then(function(data) { setProfile(Object.assign({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '', avatar_url: '' }, data)) })
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

  function handleAvatar(e) {
    var file = e.target.files && e.target.files[0]
    if (!file || !user) return
    setUploading(true)
    var path = 'avatars/' + user.id + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    supabase.storage.from('knowledge').upload(path, file, { upsert: true })
      .then(function (r) { if (r.error) throw r.error; return supabase.storage.from('knowledge').createSignedUrl(path, 60 * 60 * 24 * 365) })
      .then(function (r) { if (r.error) throw r.error; var url = r.data.signedUrl; setProfile(function (f) { return Object.assign({}, f, { avatar_url: url }) }); return updateProfile({ avatar_url: url }) })
      .catch(function (err) { window.alert('Error al subir la foto: ' + err.message) })
      .finally(function () { setUploading(false); if (fileRef.current) fileRef.current.value = '' })
  }

  function copyId() {
    if (!user) return
    try { navigator.clipboard.writeText(user.id) } catch (_) { /* noop */ }
    setCopied(true); setTimeout(function () { setCopied(false) }, 1800)
  }

  function changePassword() {
    if (!user || !user.email) return
    supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin + '/reset-password' })
      .then(function () { setPwSent(true); setTimeout(function () { setPwSent(false) }, 3000) })
      .catch(function (e) { window.alert('Error: ' + e.message) })
  }

  function signOutEverywhere() {
    if (!window.confirm('¿Cerrar sesión en todos los dispositivos?')) return
    supabase.auth.signOut({ scope: 'global' }).then(function () { window.location.href = '/login' }).catch(function (e) { window.alert('Error: ' + e.message) })
  }

  function deleteAccount() {
    window.location.href = 'mailto:marcroson7@gmail.com?subject=' + encodeURIComponent('Eliminar mi cuenta AKIRA') + '&body=' + encodeURIComponent('Quiero eliminar mi cuenta y todos mis datos (derecho de supresión, RGPD).')
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  var initial = (profile.full_name || (user && user.email) || 'A').trim().charAt(0).toUpperCase()

  return (
    <div>
      <Section title="Información personal" description="Tu nombre, foto e información de contacto visible en AKIRA">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="Foto de perfil" style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '1px solid var(--border)' }} />
            : <span style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800 }}>{initial}</span>}
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
            <MiniBtn label={uploading ? 'Subiendo…' : 'Subir foto'} icon={Upload} onClick={function () { if (fileRef.current) fileRef.current.click() }} disabled={uploading} />
            <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '6px' }}>PNG o JPG. Se mostrará en tu perfil y en las notificaciones.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Nombre completo" hint="Puedes cambiarlo cuando quieras (recomendado: no más de una vez cada 30 días).">
            <input value={profile.full_name || ''} onChange={set('full_name')} placeholder="Tu nombre" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Empresa">
            <input value={profile.company || ''} onChange={set('company')} placeholder="Nombre de tu empresa" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Rol / Cargo">
            <input value={profile.role || ''} onChange={set('role')} placeholder="Ej: Director Creativo" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Teléfono">
            <input value={profile.phone || ''} onChange={set('phone')} placeholder="+34 600 000 000" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Sitio web">
            <input value={profile.website || ''} onChange={set('website')} placeholder="https://tuwebsite.com" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Ubicación">
            <input value={profile.location || ''} onChange={set('location')} placeholder="Madrid, España" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        <Field label="Bio" hint="Una descripción breve sobre ti o tu negocio">
          <textarea value={profile.bio || ''} onChange={set('bio')} placeholder="Cuéntanos sobre ti..." rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
        </div>
      </Section>

      <RowSection title="Seguridad de la cuenta" description="Protege el acceso a tu cuenta de AKIRA.">
        <Row title="Correo electrónico" description={user ? user.email : 'Tu correo de acceso.'}>
          <MiniBtn label="Gestionar" onClick={function () { window.alert('Para cambiar tu correo de acceso, escríbenos a marcroson7@gmail.com.') }} />
        </Row>
        <Row title="Contraseña" description="Te enviaremos un enlace a tu correo para cambiarla de forma segura.">
          <MiniBtn label={pwSent ? 'Enlace enviado' : 'Cambiar contraseña'} icon={pwSent ? Check : undefined} onClick={changePassword} />
        </Row>
        <Row title="Verificación en dos pasos" description="Añade una capa extra de seguridad al iniciar sesión." badge="Próximamente">
          <MiniBtn label="Activar" disabled />
        </Row>
        <Row title="Passkeys" description="Inicia sesión con huella o Face ID en vez de contraseña." last badge="Próximamente">
          <MiniBtn label="Añadir passkey" disabled />
        </Row>
      </RowSection>

      <RowSection title="Soporte" description="Ayuda y gestión de tu cuenta.">
        <Row title="Acceso de soporte" description="Permite que el equipo de soporte acceda temporalmente a tu cuenta para ayudarte. Puedes revocarlo cuando quieras.">
          <Toggle checked={prefs.support_access} onClick={function () { setPref('support_access', !prefs.support_access) }} />
        </Row>
        <Row title="Eliminar mi cuenta" description="Borra tu cuenta y todos tus datos de forma permanente (derecho de supresión, RGPD)." last>
          <MiniBtn label="Eliminar mi cuenta" danger onClick={deleteAccount} />
        </Row>
      </RowSection>

      <RowSection title="Dispositivos" description="Sesiones activas de tu cuenta.">
        <Row title="Cerrar sesión en todos los dispositivos" description="Útil si crees que alguien más tiene acceso a tu cuenta." last>
          <MiniBtn label="Cerrar todas" danger onClick={signOutEverywhere} />
        </Row>
      </RowSection>

      <RowSection title="ID de usuario" description="Tu identificador único en AKIRA (útil para soporte).">
        <Row title="ID de usuario" description={user ? user.id : '—'} last>
          <MiniBtn label={copied ? 'Copiado' : 'Copiar'} icon={copied ? Check : Copy} onClick={copyId} />
        </Row>
      </RowSection>
    </div>
  )
}

export default ProfileTab
