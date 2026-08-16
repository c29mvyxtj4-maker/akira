import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { useOrg } from '@/shared/context/OrgContext'
import { checkFeatureAccess } from '@/services/billing.service'
import { PLAN_TIERS } from '@/shared/config/constants'

// Gatea `children` segÃºn el plan de la org activa. Uso:
//   <FeatureGate feature={FEATURES.AI_OPERATIVES}>
//     <AIOperativesPanel />
//   </FeatureGate>
//
// `currentUsage` es opcional: pÃ¡salo cuando la feature tiene un limit_value
// numÃ©rico (p.ej. FEATURES.MAX_PROJECTS) para que el gate compare contra Ã©l.
// Sin backend/Stripe aÃºn: esto solo lee organizations.plan y feature_limits.
export default function FeatureGate({ feature, currentUsage, fallback, children }) {
  var { org } = useOrg()
  var [state, setState] = useState({ loading: true, access: null })

  useEffect(function() {
    if (!org || !org.id) return
    var cancelled = false
    setState({ loading: true, access: null })
    checkFeatureAccess(org.id, feature, currentUsage)
      .then(function(access) { if (!cancelled) setState({ loading: false, access: access }) })
      .catch(function() { if (!cancelled) setState({ loading: false, access: { allowed: true } }) }) // fail-open
    return function() { cancelled = true }
  }, [org && org.id, feature, currentUsage])

  if (state.loading || !state.access) return null
  if (state.access.allowed) return children

  return fallback !== undefined ? fallback : <UpgradeCTA access={state.access} />
}

function UpgradeCTA({ access }) {
  var tierInfo = PLAN_TIERS[access.tier] || { label: access.tier }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px',
      padding: '32px 24px', borderRadius: 'var(--radius-lg, 12px)',
      border: '1px dashed var(--border)', background: 'var(--bg-3)',
    }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock style={{ width: '16px', height: '16px', color: 'var(--brand)' }} />
      </div>
      <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)' }}>
        Esta funciÃ³n no estÃ¡ disponible en tu plan {tierInfo.label}
      </p>
      <p style={{ fontSize: '12.5px', color: 'var(--text-4)', maxWidth: '320px' }}>
        {access.limit != null
          ? 'Has alcanzado el lÃ­mite de tu plan actual (' + access.limit + ').'
          : 'Actualiza tu plan para desbloquear esta funciÃ³n.'}
      </p>
    </div>
  )
}

