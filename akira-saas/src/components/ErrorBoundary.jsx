import { Component } from 'react'

/**
 * Límite de error global.
 *
 * Captura cualquier error de renderizado por debajo de él y muestra una
 * pantalla de recuperación en vez de dejar la app en blanco. Los errores de
 * React solo se capturan con componentes de clase, por eso este no es funcional.
 *
 * Punto único para enganchar monitorización (Sentry, etc.) más adelante:
 * ver `componentDidCatch`.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Visible en consola en desarrollo y producción.
    console.error('[AKIRA] Error no controlado:', error, info)
    // TODO (roadmap P1): reportar a Sentry aquí.
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = import.meta.env.DEV
    const message = this.state.error?.message || 'Error desconocido'

    return (
      <div style={S.wrap} role="alert" aria-live="assertive">
        <div style={S.card}>
          <div style={S.sun} aria-hidden="true" />
          <h1 style={S.title}>Algo ha fallado</h1>
          <p style={S.text}>
            Ha ocurrido un error inesperado y esta pantalla no ha podido cargarse.
            Tus datos están a salvo. Prueba a recargar; si vuelve a pasar, vuelve al inicio.
          </p>

          <div style={S.actions}>
            <button type="button" onClick={this.handleReload} style={S.primary}>
              Recargar la página
            </button>
            <button type="button" onClick={this.handleHome} style={S.secondary}>
              Volver al inicio
            </button>
          </div>

          {isDev && (
            <pre style={S.detail}>{message}</pre>
          )}
        </div>
      </div>
    )
  }
}

const S = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0d',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '40px 32px',
  },
  sun: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    margin: '0 auto 20px',
    background: 'radial-gradient(circle at 50% 34%, #ff8a3a 0%, #ff5a1e 30%, #ff2606 62%, #e11400 100%)',
    boxShadow: '0 0 26px rgba(255,60,30,0.5)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: '0 0 10px',
  },
  text: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.55)',
    margin: '0 0 24px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primary: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#e63946',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondary: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  detail: {
    marginTop: '24px',
    padding: '12px 14px',
    background: 'rgba(230,57,70,0.08)',
    border: '1px solid rgba(230,57,70,0.2)',
    borderRadius: '10px',
    color: '#ff8a94',
    fontSize: '12px',
    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowX: 'auto',
  },
}
