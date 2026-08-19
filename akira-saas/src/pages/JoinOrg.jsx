import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Check, AlertTriangle } from 'lucide-react'

export default function JoinOrg() {
  var [status,  setStatus]  = useState('loading')
  var [orgName, setOrgName] = useState('')
  var [error,   setError]   = useState('')
  var [params]  = useSearchParams()
  var navigate  = useNavigate()
  var token     = params.get('token')

  useEffect(function() {
    if (!token) { setStatus('error'); setError('Token de invitacion no valido'); return }

    // Verificar invitacion
    supabase
      .from('org_invitations')
      .select('*, organizations(id, name)')
      .eq('token', token)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .single()
      .then(function(res) {
        if (res.error || !res.data) {
          setStatus('error')
          setError('La invitacion no es valida o ha expirado')
          return
        }

        var inv = res.data
        setOrgName(inv.organizations.name)

        // Verificar si el usuario está logueado
        return supabase.auth.getSession().then(function(sessionRes) {
          if (!sessionRes.data || !sessionRes.data.session) {
            // Pedir login primero
            setStatus('needsLogin')
            return
          }

          var userId = sessionRes.data.session.user.id

          // Aceptar invitación
          return supabase.from('org_members').insert({
            org_id:    inv.org_id,
            user_id:   userId,
            role:      inv.role,
            invited_by: inv.invited_by,
            joined_at: new Date().toISOString(),
          }).then(function() {
            return supabase.from('org_invitations').update({ accepted: true }).eq('id', inv.id)
          }).then(function() {
            setStatus('success')
            setTimeout(function() { navigate('/settings?tab=team') }, 2000)
          })
        })
      })
      .catch(function(e) { setStatus('error'); setError(e.message) })
  }, [token])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '380px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
      >
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 auto 20px', boxShadow: '0 0 24px rgba(230,57,70,0.4)' }}>A</div>

        {status === 'loading' && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Verificando invitacion...</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>Espera un momento</p>
          </>
        )}

        {status === 'needsLogin' && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Unirte a {orgName}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-4)', marginBottom: '20px', lineHeight: 1.6 }}>
              Necesitas iniciar sesion para aceptar la invitacion
            </p>
            <button type="button" onClick={function() { navigate('/login?redirect=/join?token=' + token) }}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Iniciar sesion</button>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check style={{ width: '24px', height: '24px', color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Te has unido a {orgName}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>Redirigiendo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle style={{ width: '24px', height: '24px', color: 'var(--brand)' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Invitacion no valida</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-4)', marginBottom: '20px' }}>{error}</p>
            <button type="button" onClick={function() { navigate('/') }}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Ir al inicio</button>
          </>
        )}
      </motion.div>
    </div>
  )
}
