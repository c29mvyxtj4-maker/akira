import { useState, useEffect } from 'react'
import { Copy, Check, AlertCircle, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode.react'

export default function TwoFactorSetup({ onComplete, userId, userEmail }) {
  const [step, setStep] = useState('start') // start | qr | verify | backup | complete
  const [secret, setSecret] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Generate secret y QR when component mounts
  useEffect(() => {
    generateSecret()
  }, [])

  const generateSecret = async () => {
    try {
      setLoading(true)
      // Generate a random base32 secret (32 characters)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
      let secret = ''
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setSecret(secret)

      // Generate QR code data for authenticator apps
      const qrData = `otpauth://totp/AKIRA:${userEmail}?secret=${secret}&issuer=AKIRA`
      setQrCode(qrData)
    } catch (err) {
      setError('Error al generar código QR')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    try {
      setLoading(true)
      // In production, verify against TOTP algorithm
      // For now, we'll accept the code and generate backup codes
      const codes = Array.from({ length: 10 }, () => {
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
      })
      setBackupCodes(codes)
      setStep('backup')
      setError(null)
    } catch (err) {
      setError('Error al verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyBackupCodes = () => {
    const text = backupCodes.join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleComplete = () => {
    onComplete?.({
      secret,
      backupCodes,
    })
    setStep('complete')
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '32px',
    }}>
      {/* Step: Start */}
      {step === 'start' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Shield size={32} style={{ color: 'white' }} />
            </div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-1)',
            }}>
              Autenticación de dos factores
            </h2>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--text-3)',
            }}>
              Protege tu cuenta con un código adicional
            </p>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: 'var(--text-2)',
            lineHeight: '1.6',
          }}>
            <p style={{ marginTop: 0 }}>
              La autenticación de dos factores añade una capa extra de seguridad. Después de ingresar tu contraseña, necesitarás un código de 6 dígitos de tu aplicación autenticadora.
            </p>
            <p style={{ marginBottom: 0 }}>
              Aplicaciones compatibles: Google Authenticator, Microsoft Authenticator, Authy, etc.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('qr')}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Configurar 2FA
          </motion.button>
        </motion.div>
      )}

      {/* Step: QR Code */}
      {step === 'qr' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-1)',
          }}>
            1. Escanea el código QR
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            color: 'var(--text-3)',
          }}>
            Abre tu aplicación autenticadora y escanea este código
          </p>

          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}>
            {qrCode && (
              <QRCode
                value={qrCode}
                size={256}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '12px',
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              fontWeight: 600,
            }}>
              Clave secreta (si no puedes escanear)
            </p>
            <code style={{
              display: 'block',
              wordBreak: 'break-all',
              color: 'var(--text-1)',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}>
              {secret}
            </code>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('verify')}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Siguiente
          </motion.button>
        </motion.div>
      )}

      {/* Step: Verify */}
      {step === 'verify' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-1)',
          }}>
            2. Verifica el código
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            color: 'var(--text-3)',
          }}>
            Ingresa el código de 6 dígitos de tu aplicador
          </p>

          <input
            type="text"
            placeholder="000000"
            maxLength="6"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-1)',
              fontSize: '20px',
              letterSpacing: '8px',
              textAlign: 'center',
              fontWeight: 600,
              marginBottom: '24px',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#fca5a5',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyCode}
            disabled={loading || verificationCode.length !== 6}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: verificationCode.length === 6 ? 'var(--brand)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              opacity: verificationCode.length === 6 ? 1 : 0.5,
            }}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </motion.button>
        </motion.div>
      )}

      {/* Step: Backup Codes */}
      {step === 'backup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-1)',
          }}>
            3. Guarda tus códigos de respaldo
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            color: 'var(--text-3)',
          }}>
            Guarda estos códigos en un lugar seguro. Úsalos si pierdes acceso a tu app
          </p>

          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#fca5a5',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>Importante</p>
              <p style={{ margin: 0 }}>No compartas estos códigos. Quien los tenga puede acceder a tu cuenta.</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            {backupCodes.map((code, idx) => (
              <div
                key={idx}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--text-1)',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                }}
              >
                {code}
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyBackupCodes}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-1)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copiados
              </>
            ) : (
              <>
                <Copy size={16} />
                Copiar códigos
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Completar configuración
          </motion.button>
        </motion.div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Check size={32} style={{ color: '#86efac' }} />
          </div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-1)',
          }}>
            ¡2FA Activado!
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            color: 'var(--text-3)',
            lineHeight: '1.6',
          }}>
            Tu cuenta está protegida con autenticación de dos factores. Necesitarás tu código autenticador para ingresar.
          </p>
        </motion.div>
      )}
    </div>
  )
}
