import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Sparkles, PenSquare } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import CommandPalette from '@/components/layout/CommandPalette'
import AskAkiraButton from '@/components/akira/AskAkiraButton'

/*
 * Barra inferior global (sustituye a la sidebar como navegación principal).
 * Aparece en todas las páginas: Inicio · Buscar (Ctrl/Cmd+K) · Preguntar a
 * AKIRA (chat en la página actual) · Crear. Va en el flujo (no fixed) para que
 * reserve su espacio y nunca tape el contenido.
 */
export default function BottomBar() {
  var navigate = useNavigate()
  var location = useLocation()
  var [cmdOpen, setCmdOpen] = useState(false)
  var [aiOpen, setAiOpen]   = useState(false)

  useEffect(function () {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(function (v) { return !v }) }
    }
    window.addEventListener('keydown', onKey)
    return function () { window.removeEventListener('keydown', onKey) }
  }, [])

  var atHome = location.pathname === '/inicio' || location.pathname === '/'

  return (
    <>
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '10px 12px calc(var(--safe-bottom) + 10px)', position: 'relative', zIndex: 40 }}>
        <div style={{ width: 'min(94vw, 560px)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '999px', background: 'var(--bg-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-modal)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <button type="button" onClick={function () { navigate('/inicio') }} aria-label="Inicio" title="Inicio"
            style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid ' + (atHome ? 'var(--brand-border)' : 'var(--border)'),
              background: atHome ? 'var(--brand-dim)' : 'var(--bg-3)', color: atHome ? 'var(--brand)' : 'var(--text-2)' }}>
            <Home style={{ width: '18px', height: '18px' }} />
          </button>
          <button type="button" onClick={function () { setCmdOpen(true) }} aria-label="Buscar (Ctrl+K)" title="Buscar (Ctrl+K)"
            style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search style={{ width: '18px', height: '18px' }} />
          </button>
          <button type="button" onClick={function () { setAiOpen(true) }}
            style={{ flex: 1, height: '44px', borderRadius: '999px', border: '1px solid var(--brand-border)', background: 'var(--brand-dim)', color: 'var(--brand)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
            <Sparkles style={{ width: '17px', height: '17px' }} /> <span className="hidden sm:inline">Preguntar a</span> AKIRA
          </button>
          <button type="button" onClick={function () { navigate(ROUTES.KNOWLEDGE + '?new=1') }} aria-label="Nueva página de conocimiento" title="Crear página de conocimiento"
            style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PenSquare style={{ width: '17px', height: '17px' }} />
          </button>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={function () { setCmdOpen(false) }} />
      <AskAkiraButton controlledOpen={aiOpen} onOpenChange={setAiOpen} hideFab
        contextLabel="AKIRA" contextText={'El usuario está en la página ' + location.pathname + ' de AKIRA.'} />
    </>
  )
}
