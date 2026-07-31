import { Row, RowSection, MiniBtn } from './_shared'

/*
 * Identidad (grupo Administración) — inicio de sesión y gestión de usuarios a
 * nivel de dominio (SSO/SAML). Funciones de nivel empresa; de momento informativo.
 */
function IdentityTab() {
  return (
    <div>
      <RowSection title="Inicio de sesión" description="Cómo acceden las personas a tu espacio de trabajo.">
        <Row title="Dominios verificados" description="Reclama tu dominio de correo para gestionar automáticamente a los usuarios de tu empresa." badge="Próximamente">
          <MiniBtn label="Verificar dominio" disabled />
        </Row>
        <Row title="Inicio de sesión único (SSO / SAML)" description="Permite que tu equipo acceda con el proveedor de identidad de tu empresa (Google, Okta, Azure AD)." last badge="Próximamente">
          <MiniBtn label="Configurar SSO" disabled />
        </Row>
      </RowSection>

      <RowSection title="Gestión de usuarios" description="Controla las cuentas de los usuarios de tu dominio.">
        <Row title="Panel de usuarios gestionados" description="Gestiona a los usuarios con dominio verificado desde un único lugar." badge="Próximamente">
          <MiniBtn label="Abrir" disabled />
        </Row>
        <Row title="Forzar restablecimiento de contraseña" description="Obliga a los usuarios a cambiar su contraseña en el próximo inicio de sesión." last badge="Próximamente">
          <MiniBtn label="Aplicar" disabled />
        </Row>
      </RowSection>
    </div>
  )
}

export default IdentityTab
