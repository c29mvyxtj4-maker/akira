import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, description, actions }) {
  var navigate = useNavigate()
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {actions}
        <button type="button" onClick={function () { navigate(-1) }} aria-label="Volver atrás" title="Volver atrás"
          style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  )
}