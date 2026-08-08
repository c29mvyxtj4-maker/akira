import { usePrefs } from '@/hooks/usePreferences'
import { Row, RowSection, Toggle, MiniBtn } from './_shared'

/*
 * MCP de AKIRA (grupo Funciones) — conecta AKIRA con asistentes de IA (Claude,
 * etc.) mediante el Model Context Protocol. De momento, informativo.
 */
function MCPTab() {
  var [prefs, setPref] = usePrefs({ mcp_enabled: false })
  return (
    <div>
      <RowSection title="Model Context Protocol" description="Permite que asistentes de IA externos lean y actúen sobre tu espacio de AKIRA de forma segura.">
        <Row title="Habilitar servidor MCP" description="Expone un endpoint MCP para conectar herramientas como Claude o Cursor.">
          <Toggle checked={prefs.mcp_enabled} onClick={function () { setPref('mcp_enabled', !prefs.mcp_enabled) }} />
        </Row>
        <Row title="Endpoint" description="La URL que usarán los clientes MCP para conectarse a tu espacio." badge="Próximamente">
          <MiniBtn label="Copiar URL" disabled />
        </Row>
        <Row title="Tokens de acceso" description="Genera y revoca tokens para autorizar clientes MCP." last badge="Próximamente">
          <MiniBtn label="Gestionar" disabled />
        </Row>
      </RowSection>
    </div>
  )
}

export default MCPTab
