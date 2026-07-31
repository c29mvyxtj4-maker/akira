import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Sparkles, PenSquare } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import Dock from '@/components/ui/Dock'
import CommandPalette from '@/components/layout/CommandPalette'
import AskAkiraButton from '@/components/akira/AskAkiraButton'

/*
 * Barra inferior global (sustituye a la sidebar como navegación principal).
 * Ahora es un Dock estilo macOS (React Bits): los iconos se magnifican con la
 * cercanía del ratón. Inicio · Buscar (Ctrl/Cmd+K) · Preguntar a AKIRA · Crear.
 * El contenedor reserva una altura fija; la magnificación crece HACIA ARRIBA
 * sobre el contenido, sin empujar el layout.
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

  var items = [
    { icon: <Home style={{ width: '20px', height: '20px' }} />, label: 'Inicio',
      className: atHome ? 'dock-item-active' : '', onClick: function () { navigate('/inicio') } },
    { icon: <Search style={{ width: '20px', height: '20px' }} />, label: 'Buscar  (Ctrl+K)',
      onClick: function () { setCmdOpen(true) } },
    { icon: <Sparkles style={{ width: '20px', height: '20px' }} />, label: 'Preguntar a AKIRA',
      className: 'dock-item-active', onClick: function () { setAiOpen(true) } },
    { icon: <PenSquare style={{ width: '19px', height: '19px' }} />, label: 'Crear página',
      onClick: function () { navigate(ROUTES.KNOWLEDGE + '?new=1') } },
  ]

  return (
    <>
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 40, height: '82px', marginBottom: 'var(--safe-bottom)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'visible', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%' }}>
          <Dock items={items} panelHeight={58} baseItemSize={46} magnification={66} distance={170} dockHeight={106} />
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={function () { setCmdOpen(false) }} />
      <AskAkiraButton controlledOpen={aiOpen} onOpenChange={setAiOpen} hideFab
        contextLabel="AKIRA" contextText={'El usuario está en la página ' + location.pathname + ' de AKIRA.'} />
    </>
  )
}
