import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'

export default function Login() {
  var { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth()
  var [mode,     setMode]     = useState('login') // 'login' | 'signup'
  var [fullName, setFullName] = useState('')
  var [email,    setEmail]    = useState('')
  var [password, setPassword] = useState('')
  var [showPwd,  setShowPwd]  = useState(false)
  var [loading,  setLoading]  = useState(false)
  var [error,    setError]    = useState('')
  var [notice,   setNotice]   = useState('')

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  var isSignup = mode === 'signup'

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setError('')
    setNotice('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    if (!email || !password) { setError('Completa todos los campos'); return }
    if (isSignup && !fullName.trim()) { setError('Escribe tu nombre'); return }
    if (isSignup && password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (isSignup) {
        var data = await signUp(email, password, fullName.trim())
        // Si el proyecto exige confirmación por email, no hay sesión todavía.
        if (!data || !data.session) {
          setNotice('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
          setMode('login')
          setPassword('')
        }
        // Si hay sesión, isAuthenticated cambiará y redirige solo.
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || (isSignup ? 'Error al crear la cuenta' : 'Error al iniciar sesión'))
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img src="/icons/icon.svg" alt="AKIRA" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', display: 'block', margin: '0 auto 14px' }} />
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: '6px' }}>AKIRA OS</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4)' }}>Business Operating System</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-modal)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>
            {isSignup ? 'Crea tu cuenta' : 'Bienvenido'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginBottom: '24px' }}>
            {isSignup ? 'Empieza tu prueba de AKIRA' : 'Inicia sesión en tu cuenta'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isSignup && (
              <div>
                <label className="label-base">Nombre</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={function(e) { setFullName(e.target.value); setError('') }}
                  placeholder="Tu nombre"
                  className="input-base"
                  autoComplete="name"
                  style={{ marginTop: '5px' }}
                />
              </div>
            )}

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
              <label className="label-base">Contraseña</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={function(e) { setPassword(e.target.value); setError('') }}
                  placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                  className="input-base"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
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

            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '12px', color: '#22c55e' }}
              >
                <CheckCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                {notice}
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
                boxShadow: 'none',
                transition: 'all 0.15s', marginTop: '4px',
              }}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <>
                  {isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
                  <ArrowRight style={{ width: '15px', height: '15px' }} />
                </>
              )}
            </motion.button>

            {isSignup && (
              <p style={{ fontSize: '11px', color: 'var(--text-5)', textAlign: 'center', lineHeight: 1.5, marginTop: '2px' }}>
                Al crear una cuenta aceptas la{' '}
                <a href="/legal" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>Política de Privacidad y los Términos</a>.
              </p>
            )}
          </form>

          {/* Cambiar entre login y registro */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-4)', marginTop: '18px' }}>
            {isSignup ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <button type="button" onClick={switchMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '12px', fontWeight: 700, padding: 0 }}
            >
              {isSignup ? 'Inicia sesión' : 'Crear cuenta'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-5)', marginTop: '20px' }}>
          AKIRA Business OS · Beta
        </p>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
