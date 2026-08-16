import { usePrefs } from '@/hooks/usePreferences'
import { useOrg } from '@/context/OrgContext'
import { Row, RowSection, Toggle, MiniBtn } from './_shared'

/*
 * Espacio de equipo (grupo Administración) — gestión de los espacios de equipo
 * dentro del workspace. Para un solo dueño es básico; se ampliará con equipos.
 */
function TeamspaceTab() {
  var { org, members } = useOrg()
  var [prefs, setPref] = usePrefs({ teamspace_limit_creation: false, teamspace_default_join: true })
  function toggle(k) { return function () { setPref(k, !prefs[k]) } }
  return (
    <div>
      <RowSection title="Espacios de equipo" description="Agrupa a las personas y su contenido en espacios dentro de tu workspace.">
        <Row title="Espacio de equipo predeterminado" description="Los miembros nuevos se unen automáticamente a este espacio.">
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-2)' }}>{org ? org.name : 'Mi espacio'}</span>
        </Row>
        <Row title="Unir automáticamente a los miembros nuevos" description="Cada persona nueva entra directamente al espacio predeterminado.">
          <Toggle checked={prefs.teamspace_default_join} onClick={toggle('teamspace_default_join')} />
        </Row>
        <Row title="Limitar la creación de espacios a los propietarios" description="Solo los administradores podrán crear nuevos espacios de equipo." last>
          <Toggle checked={prefs.teamspace_limit_creation} onClick={toggle('teamspace_limit_creation')} />
        </Row>
      </RowSection>

      <RowSection title="Espacios existentes" description="Los espacios de equipo a los que tienes acceso.">
        <Row title={org ? org.name : 'Mi espacio'} description={(members ? members.length : 1) + ((members ? members.length : 1) === 1 ? ' miembro' : ' miembros') + ' · Predeterminado'} last>
          <MiniBtn label="Nuevo espacio" disabled />
        </Row>
      </RowSection>
    </div>
  )
}

export default TeamspaceTab
