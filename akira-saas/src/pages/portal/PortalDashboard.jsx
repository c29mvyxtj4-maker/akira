import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getPortalClientData, getPortalBranding } from '@db/queries/portal.service'
import PortalView from '@/components/portal/PortalView'

export default function PortalDashboard() {
  const [user,     setUser]     = useState(null)
  const [data,     setData]     = useState(null)
  const [branding, setBranding] = useState({ company_name: null, logo_url: null, brand_color: '#e63946' })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadPortal() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData || !sessionData.session) {
        navigate('/portal', { replace: true })
        return
      }
      const u = sessionData.session.user
      setUser(u)

      try {
        const r = await supabase
          .from('portal_users')
          .select('*, clients(id, name, company, owner_id)')
          .eq('email', u.email.toLowerCase())
          .eq('active', true)
          .single()

        if (r.error || !r.data) {
          setError('No tienes acceso al portal. Contacta con tu proveedor.')
          setLoading(false)
          return
        }

        const portalUser = r.data
        const client     = portalUser.clients
        const ownerId    = client.owner_id

        supabase.from('portal_users').update({ last_login: new Date().toISOString() }).eq('id', portalUser.id)

        const [clientData, brandingData] = await Promise.all([
          getPortalClientData(client.id, ownerId),
          getPortalBranding(ownerId),
        ])
        setBranding(brandingData)
        setData({ ...clientData, portalUser, ownerId })
        setLoading(false)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }
    loadPortal()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/portal', { replace: true })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #e63946, #a01f2b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 auto 16px' }}>A</div>
          <p style={{ fontSize: '14px', color: 'var(--text-4)' }}>Cargando tu portal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸ”’</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Acceso no disponible</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-4)', lineHeight: 1.6, marginBottom: '20px' }}>{error}</p>
          <button type="button" onClick={handleSignOut}
            style={{ padding: '8px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #e63946, #a01f2b)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >Cerrar sesion</button>
        </div>
      </div>
    )
  }

  return <PortalView data={data} branding={branding} user={user} mode="client" onExit={handleSignOut} />
}

