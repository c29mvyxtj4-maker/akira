import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowRight, Check } from 'lucide-react'

export default function PortalLogin() {
  var [email,   setEmail]   = useState('')
  var [loading, setLoading] = useState(false)
  var [sent,    setSent]    = useState(false)
  var [error,   setError]   = useState('')
  var navigate = useNavigate()

  // Si ya hay sesión activa, redirigir al dashboard del portal
  useEffect(function() {
    supabase.auth.getSession().then(function(res) {
      if (res.data && res.data.session) {
        navigate('/portal/dashboard', { replace: true })
      }
    })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin + '/portal/dashboard',
      },
    })
      .then(function(res) {
        if (res.error) throw res.error
        setSent(true)
      })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setLoading(false) })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-bg)', padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-glow)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 32px rgba(230,57,70,0.4)', fontSize: '22px', fontWeight: 900, color: '#fff' }}>A</div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Portal de Cliente</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>Accede con tu email para ver tus proyectos</p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check style={{ width: '24px', height: '24px', color: '#22c55e' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Email enviado</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-4)', lineHeight: 1.6 }}>
                Hemos enviado un enlace de acceso a <strong style={{ color: 'var(--text-2)' }}>{email}</strong>. Revisa tu bandeja de entrada.
              </p>
              <button type="button" onClick={function() { setSent(false); setEmail('') }}
                style={{ marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '13px', fontWeight: 600 }}
              >
                Usar otro email
              </button>
            </motion.div>
          ) : (
            <>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>Acceder</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '20px' }}>Te enviaremos un enlace de acceso instantáneo</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-4)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={function(e) { setEmail(e.target.value); setError('') }}
                      placeholder="tu@email.com"
                      className="input-base"
                      style={{ paddingLeft: '34px' }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--brand)' }}>
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || !email.trim()}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    background: loading || !email.trim() ? 'var(--bg-4)' : 'var(--gradient-brand)',
                    color: loading || !email.trim() ? 'var(--text-4)' : '#fff',
                    fontSize: '13px', fontWeight: 700,
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: loading || !email.trim() ? 'none' : '0 4px 16px rgba(230,57,70,0.35)',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? 'Enviando...' : <><span>Enviar enlace de acceso</span><ArrowRight style={{ width: '15px', height: '15px' }} /></>}
                </motion.button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-5)', marginTop: '20px' }}>
          Powered by AKIRA OS
        </p>
      </motion.div>
    </div>
  )
}