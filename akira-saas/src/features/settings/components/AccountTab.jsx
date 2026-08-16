import { useEffect, useState } from 'react'
import { getAccountStats } from '@/services/settings.service'
import { Section } from './_shared'

function AccountTab({ user, onSignOut }) {
  var [stats,   setStats]   = useState(null)
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    getAccountStats()
      .then(function(data) { setStats(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  var STAT_ITEMS = stats ? [
    { label: 'Clientes',        value: stats.clients },
    { label: 'Proyectos',       value: stats.projects },
    { label: 'Mov. financieros', value: stats.finance },
    { label: 'Documentos',      value: stats.documents },
    { label: 'Conversaciones IA', value: stats.conversations },
  ] : []

  return (
    <div>
      <Section title="Estadisticas de uso" description="Resumen de los datos en tu cuenta">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {STAT_ITEMS.map(function(s) {
              return (
                <div key={s.label} style={{ padding: '16px', background: 'var(--bg-3)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--brand)', margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '4px' }}>{s.label}</p>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Informacion de cuenta" description="Detalles de tu cuenta en AKIRA">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Email',        value: user ? user.email : '--' },
            { label: 'ID de cuenta', value: user ? user.id.slice(0, 8) + '...' : '--' },
            { label: 'Plan',         value: 'AKIRA Pro' },
            { label: 'Miembro desde', value: user && user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '--' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-4)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{item.value}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Sesion" description="Gestiona tu sesion activa">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Cerrar sesion</p>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '3px' }}>Saldras de tu cuenta en este dispositivo</p>
          </div>
          <button type="button" onClick={onSignOut}
            style={{ padding: '8px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >Cerrar sesion</button>
        </div>
      </Section>

      <Section title="Privacidad y términos" description="Cómo tratamos tus datos y las condiciones del servicio">
        <a href="/legal" target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e63946', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
        >Ver Política de Privacidad y Términos →</a>
      </Section>
    </div>
  )
}

export default AccountTab
