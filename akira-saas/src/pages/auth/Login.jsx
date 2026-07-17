import { useState } from 'react'
import { Navigate } from 'react-router-dom' // ← NUEVO
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react'

export default function Login() {
  var { signIn, isAuthenticated, loading: authLoading } = useAuth() // ← NUEVO: tambien sacamos isAuthenticated
  var [email,    setEmail]    = useState('')
  var [password, setPassword] = useState('')
  var [showPwd,  setShowPwd]  = useState(false)
  var [loading,  setLoading]  = useState(false)
  var [error,    setError]    = useState('')

  // ← NUEVO: si ya hay sesion iniciada, no te deja quedarte en el login
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos'); return }
    if (loading) return // ← NUEVO: evita que se envie dos veces si se hace doble clic
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-bg)', padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-glow)', pointerEvents: 'none' }} />

      {/* Decoracion */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,57,70,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 32px rgba(230,57,70,0.4)', fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em' }}>A</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: '6px' }}>AKIRA OS</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>Business Operating System</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>Bienvenido</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '24px' }}>Inicia sesion en tu cuenta</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value); setError('') }}
                placeholder="tu@email.com"
                className="input-base"
                autoComplete="email"
                style={{ marginTop: '5px' }}
              />
            </div>

            <div>
              <label className="label-base">Contrasena</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={function(e) { setPassword(e.target.value); setError('') }}
                  placeholder="Tu contrasena"
                  className="input-base"
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={function() { setShowPwd(function(v) { return !v }) }}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center' }}
                >
                  {showPwd ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--brand)' }}
              >
                <AlertTriangle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                background: loading ? 'var(--bg-4)' : 'var(--gradient-brand)',
                color: loading ? 'var(--text-4)' : '#fff',
                fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(230,57,70,0.35)',
                transition: 'all 0.15s', marginTop: '4px',
              }}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <>
                  Iniciar sesion
                  <ArrowRight style={{ width: '15px', height: '15px' }} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-5)', marginTop: '20px' }}>
          AKIRA Business OS v2.0
        </p>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}