import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Section } from './_shared'

function DangerZoneTab() {
  var [confirming, setConfirming] = useState(null)

  function handleSignOutEverywhere() {
    supabase.auth.signOut({ scope: 'global' })
      .then(function() { window.location.href = '/login' })
      .catch(function(e) { window.alert('Error: ' + e.message) })
  }

  function handleRequestDeletion() {
    var subject = 'Solicitud de eliminacion de cuenta AKIRA'
    var body = 'Hola, quiero solicitar la eliminacion completa de mi cuenta y todos mis datos de AKIRA OS (derecho de supresion, RGPD).'
    window.location.href = 'mailto:marcroson7@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
  }

  return (
    <div>
      <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '12px', color: '#f59e0b' }}>
        Las acciones de aqui abajo son delicadas. Leelas bien antes de tocar nada.
      </div>

      <Section title="Cerrar sesión en todos los dispositivos" description="Útil si crees que alguien más tiene acceso a tu cuenta">
        {confirming === 'signout' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={function() { setConfirming(null) }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button type="button" onClick={handleSignOutEverywhere}
              style={{ flex: 2, padding: '9px', borderRadius: '8px', background: '#f59e0b', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Si, cerrar todas las sesiones</button>
          </div>
        ) : (
          <button type="button" onClick={function() { setConfirming('signout') }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >Cerrar sesion en todos los dispositivos</button>
        )}
      </Section>

      <Section title="Eliminar mi cuenta" description="Borra tu cuenta y todos tus datos de forma permanente">
        <p style={{ fontSize: '12px', color: 'var(--text-4)', lineHeight: 1.6 }}>
          Por seguridad, eliminar una cuenta del todo (incluido tu acceso de login) requiere una revision manual — no se puede hacer con un solo clic desde aqui.
          Al pulsar el boton, se abrira tu correo con una solicitud ya redactada; procesaremos la eliminacion de todos tus datos en un plazo maximo de 30 dias (derecho de supresion, RGPD). Antes, puedes descargar una copia en Ajustes → Importar y exportar.
        </p>
        {confirming === 'delete' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={function() { setConfirming(null) }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button type="button" onClick={handleRequestDeletion}
              style={{ flex: 2, padding: '9px', borderRadius: '8px', background: '#e63946', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Si, solicitar eliminacion</button>
          </div>
        ) : (
          <button type="button" onClick={function() { setConfirming('delete') }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >Solicitar eliminacion de cuenta</button>
        )}
      </Section>
    </div>
  )
}


export default DangerZoneTab
