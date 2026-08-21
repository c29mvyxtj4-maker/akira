import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { ROUTES } from '@/shared/config/constants'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Error al enviar el email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-text-3 hover:text-text-2 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-status-success" />
            </div>
            <h2 className="text-xl font-bold text-text-1 mb-2">Email enviado</h2>
            <p className="text-text-3 text-sm">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-text-1 mb-1">Restablecer contraseña</h2>
            <p className="text-text-3 text-sm mb-8">
              Introduce tu email y te enviaremos un enlace de recuperación.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-base">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="input-base pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-status-danger text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-base w-full bg-brand-500 hover:bg-brand-600 text-white h-10 text-sm font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
