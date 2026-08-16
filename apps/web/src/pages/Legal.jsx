import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Página legal pública (Privacidad + Términos).
 *
 * PLANTILLA orientada al RGPD (España/UE). Revísala y sustituye los campos
 * entre [CORCHETES] por tus datos reales. No es asesoramiento legal:
 * conviene que un profesional la valide antes de un lanzamiento serio.
 */
// Datos del responsable. Rellenados con lo conocido; revisa/sustituye lo que
// falte entre [CORCHETES] antes de un lanzamiento serio.
var CONTROLLER = 'Marc Rosón Martí'
var CONTACT_EMAIL = 'marcroson7@gmail.com'
var UPDATED = '31 de julio de 2026'

export default function Legal() {
  var navigate = useNavigate()
  var [tab, setTab] = useState('privacy')

  var wrap = { minHeight: '100vh', background: 'var(--bg-base, #0a0a0d)', color: 'var(--text-2, #b7b3ba)' }
  var container = { maxWidth: '760px', margin: '0 auto', padding: '32px 20px 80px' }
  var h1 = { fontSize: '26px', fontWeight: 900, color: 'var(--text-1, #fff)', letterSpacing: '-0.02em', margin: '0 0 6px' }
  var h2 = { fontSize: '16px', fontWeight: 800, color: 'var(--text-1, #fff)', margin: '28px 0 8px' }
  var p  = { fontSize: '14px', lineHeight: 1.7, margin: '0 0 12px' }
  var li = { fontSize: '14px', lineHeight: 1.7, margin: '0 0 6px' }

  return (
    <div style={wrap}>
      <div style={container}>
        <button type="button" onClick={function() { navigate(-1) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-4, #888)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>
          <ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver
        </button>

        <h1 style={h1}>Información legal</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4, #888)', margin: '0 0 20px' }}>
          Última actualización: {UPDATED}
        </p>

        {/* Pestañas */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border, #2a2a31)', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[['privacy', 'Política de Privacidad'], ['terms', 'Términos del Servicio'], ['notice', 'Aviso Legal']].map(function(t) {
            var active = tab === t[0]
            return (
              <button key={t[0]} type="button" onClick={function() { setTab(t[0]) }}
                style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: active ? '2px solid var(--brand, #e63946)' : '2px solid transparent',
                  color: active ? 'var(--brand, #e63946)' : 'var(--text-4, #888)', fontSize: '13px', fontWeight: active ? 700 : 500 }}>
                {t[1]}
              </button>
            )
          })}
        </div>

        {tab === 'privacy' && (
          <div>
            <p style={p}>
              En AKIRA nos tomamos en serio tu privacidad. Esta política explica qué datos tratamos,
              con qué fin y qué derechos tienes, conforme al Reglamento General de Protección de Datos (RGPD).
            </p>

            <h2 style={h2}>1. Responsable del tratamiento</h2>
            <p style={p}>
              {CONTROLLER}, con NIF [NIF] y domicilio en [DIRECCIÓN], y correo de contacto
              <strong> {CONTACT_EMAIL}</strong>, es el responsable del tratamiento de tus datos.
            </p>

            <h2 style={h2}>2. Datos que tratamos</h2>
            <ul>
              <li style={li}>• <strong>Cuenta:</strong> nombre, email y contraseña (cifrada).</li>
              <li style={li}>• <strong>Datos de negocio</strong> que tú introduces: clientes, proyectos, facturas, finanzas, documentos.</li>
              <li style={li}>• <strong>Datos de uso</strong> y técnicos: registros de acceso y errores para mantener el servicio.</li>
              <li style={li}>• <strong>Pagos:</strong> si cobras online, los datos de tarjeta los procesa <strong>Stripe</strong>; nosotros no almacenamos números de tarjeta.</li>
            </ul>

            <h2 style={h2}>3. Finalidad y base legal</h2>
            <p style={p}>
              Tratamos tus datos para prestarte el servicio (ejecución del contrato), enviarte
              comunicaciones necesarias, cumplir obligaciones legales (p. ej. facturación) y mejorar la
              plataforma (interés legítimo). No vendemos tus datos.
            </p>

            <h2 style={h2}>4. Encargados y terceros</h2>
            <p style={p}>Nos apoyamos en proveedores que actúan como encargados del tratamiento:</p>
            <ul>
              <li style={li}>• <strong>Supabase</strong> — base de datos y autenticación (alojamiento en la UE).</li>
              <li style={li}>• <strong>Vercel</strong> — alojamiento de la aplicación web.</li>
              <li style={li}>• <strong>Stripe</strong> — procesamiento de pagos.</li>
              <li style={li}>• <strong>Resend</strong> — envío de correos electrónicos.</li>
              <li style={li}>• <strong>Sentry</strong> — monitorización de errores.</li>
              <li style={li}>• <strong>Google (Gemini)</strong> — funciones de inteligencia artificial.</li>
            </ul>

            <h2 style={h2}>5. Conservación</h2>
            <p style={p}>
              Conservamos tus datos mientras tu cuenta esté activa y durante los plazos legales aplicables
              (p. ej. obligaciones fiscales). Puedes solicitar su eliminación en cualquier momento.
            </p>

            <h2 style={h2}>6. Tus derechos (RGPD)</h2>
            <p style={p}>
              Tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento, y a la
              portabilidad de tus datos. Puedes exportar todos tus datos desde <strong>Ajustes → Importar y exportar</strong>,
              y para el resto de derechos escríbenos a <strong>{CONTACT_EMAIL}</strong> (responderemos en un plazo máximo de 30 días).
              También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
            </p>

            <h2 style={h2}>7. Seguridad</h2>
            <p style={p}>
              Aplicamos medidas técnicas y organizativas (cifrado, control de acceso por filas, copias de
              seguridad) para proteger tu información.
            </p>

            <h2 style={h2}>8. Cookies</h2>
            <p style={p}>
              Usamos únicamente cookies y almacenamiento técnicos necesarios para iniciar sesión y para el
              funcionamiento del servicio. No usamos cookies publicitarias.
            </p>
          </div>
        )}

        {tab === 'terms' && (
          <div>
            <h2 style={h2}>1. Aceptación</h2>
            <p style={p}>
              Al crear una cuenta y usar AKIRA aceptas estos términos. Si no estás de acuerdo, no uses el servicio.
            </p>
            <h2 style={h2}>2. El servicio</h2>
            <p style={p}>
              AKIRA es una plataforma de gestión de negocio (clientes, proyectos, finanzas, facturas).
              Se ofrece <strong>en fase beta</strong>: puede contener errores y sufrir cambios o interrupciones.
            </p>
            <h2 style={h2}>3. Tu cuenta</h2>
            <p style={p}>
              Eres responsable de la confidencialidad de tus credenciales y de la actividad de tu cuenta,
              así como de la veracidad y legalidad de los datos que introduces.
            </p>
            <h2 style={h2}>4. Pagos</h2>
            <p style={p}>
              Los cobros a tus clientes se procesan a través de Stripe y están sujetos a sus condiciones.
              Las comisiones de la pasarela corren por cuenta de quien cobra.
            </p>
            <h2 style={h2}>5. Uso aceptable</h2>
            <p style={p}>
              No puedes usar AKIRA para actividades ilícitas, ni intentar vulnerar su seguridad o la de otros usuarios.
            </p>
            <h2 style={h2}>6. Responsabilidad</h2>
            <p style={p}>
              Durante la beta, el servicio se presta “tal cual”, sin garantías. En la medida permitida por la ley,
              no nos responsabilizamos de pérdidas derivadas del uso del servicio. Haz copias de tus datos importantes.
            </p>
            <h2 style={h2}>7. Cambios y baja</h2>
            <p style={p}>
              Podemos actualizar estos términos y el servicio. Puedes darte de baja cuando quieras solicitando la
              eliminación de tu cuenta desde <strong>Ajustes → Zona de peligro</strong> o escribiendo a <strong>{CONTACT_EMAIL}</strong>.
            </p>
            <h2 style={h2}>8. Ley aplicable</h2>
            <p style={p}>
              Estos términos se rigen por la legislación española.
            </p>
          </div>
        )}

        {tab === 'notice' && (
          <div>
            <p style={p}>
              En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la
              Información y de Comercio Electrónico (LSSI-CE), se facilita la siguiente información:
            </p>

            <h2 style={h2}>1. Titular</h2>
            <ul>
              <li style={li}>• <strong>Titular:</strong> {CONTROLLER}</li>
              <li style={li}>• <strong>NIF:</strong> [NIF]</li>
              <li style={li}>• <strong>Domicilio:</strong> [DIRECCIÓN]</li>
              <li style={li}>• <strong>Correo:</strong> {CONTACT_EMAIL}</li>
            </ul>

            <h2 style={h2}>2. Objeto</h2>
            <p style={p}>
              AKIRA OS es una aplicación web de gestión de negocio (clientes, proyectos, finanzas y
              facturación) dirigida a profesionales y pequeñas empresas. Actualmente se ofrece en fase beta.
            </p>

            <h2 style={h2}>3. Propiedad intelectual</h2>
            <p style={p}>
              El software, la marca y los contenidos de la plataforma pertenecen a su titular. Los datos que
              tú introduces siguen siendo tuyos; puedes exportarlos o eliminarlos cuando quieras.
            </p>

            <h2 style={h2}>4. Responsabilidad</h2>
            <p style={p}>
              El titular no se hace responsable del uso que hagas del servicio ni de la licitud de los datos
              que introduces sobre terceros (p. ej. tus clientes), de los que eres tú el responsable.
            </p>

            <h2 style={h2}>5. Legislación y jurisdicción</h2>
            <p style={p}>
              Este aviso se rige por la legislación española. Para cualquier controversia serán competentes
              los juzgados y tribunales del domicilio del titular, salvo que la ley disponga otra cosa.
            </p>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-5, #666)', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border, #2a2a31)' }}>
          Esta es una plantilla orientativa conforme al RGPD. Sustituye los campos entre [CORCHETES] y
          consulta a un profesional antes de un lanzamiento a gran escala.
        </p>
      </div>
    </div>
  )
}
