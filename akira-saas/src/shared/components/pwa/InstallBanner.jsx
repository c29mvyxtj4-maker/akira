import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, RefreshCw } from 'lucide-react'
import { usePWA } from '@/shared/hooks/usePWA'

export default function InstallBanner() {
  var { canInstall, isIOS, isInstalled, updateAvailable, install, applyUpdate } = usePWA()
  var [dismissed, setDismissed] = useState(
    localStorage.getItem('akira-pwa-dismissed') === 'true'
  )

  function dismiss() {
    localStorage.setItem('akira-pwa-dismissed', 'true')
    setDismissed(true)
  }

  if (updateAvailable) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        style={{
          position: 'fixed', bottom: '16px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: '400px',
          background: 'var(--bg-3)',
          border: '1px solid rgba(230,57,70,0.3)',
          borderRadius: '14px', padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(230,57,70,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <RefreshCw style={{ width: '18px', height: '18px', color: 'var(--brand)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '2px' }}>Actualizacion disponible</p>
          <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>Nueva version de AKIRA lista</p>
        </div>
        <button
          type="button"
          onClick={applyUpdate}
          style={{ padding: '7px 14px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
        >
          Actualizar
        </button>
      </motion.div>
    )
  }

  if (!canInstall || isInstalled || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ delay: 2, duration: 0.3 }}
        style={{
          position: 'fixed', bottom: '16px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: '400px',
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-5)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}>A</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '3px' }}>Instalar AKIRA OS</p>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', lineHeight: 1.5 }}>
              {isIOS
                ? 'Pulsa compartir y luego "Agregar a pantalla de inicio"'
                : 'Instala AKIRA como app nativa en tu dispositivo'
              }
            </p>
          </div>
        </div>

        {isIOS ? (
          <div style={{ background: 'var(--bg-4)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.7 }}>
            <p>1. Pulsa el icono <strong style={{ color: 'var(--text-1)' }}>Compartir</strong> en Safari –¬†ï¸</p>
            <p>2. Toca <strong style={{ color: 'var(--text-1)' }}>"Agregar a pantalla de inicio"</strong></p>
            <p>3. Pulsa <strong style={{ color: 'var(--text-1)' }}>"Agregar"</strong></p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={dismiss}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={function() { install().then(function(ok) { if (ok) dismiss() }) }}
              style={{ flex: 2, padding: '8px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              Instalar app
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
