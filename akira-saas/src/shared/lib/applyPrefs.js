import { getPref } from '@/shared/hooks/usePreferences'

/*
 * Aplica las preferencias visuales globales (tema, contraste, reducir
 * movimiento) a la raíz del documento. Se llama al arrancar la app y cada vez
 * que cambia una preferencia (evento 'akira-prefs-change'), para que el efecto
 * sea global y no solo mientras el modal de Ajustes está abierto.
 */
export function applyPrefs() {
  if (typeof document === 'undefined') return
  var root = document.documentElement

  var theme = getPref('pref_theme', 'system')
  var systemLight = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  var wantLight = theme === 'light' || (theme === 'system' && systemLight)
  root.classList.toggle('light', !!wantLight)

  root.classList.toggle('high-contrast', getPref('pref_high_contrast', false) === true)

  var reduce = getPref('pref_reduce_motion', false) === true
  root.classList.toggle('reduce-motion', reduce)
}

// Instala los listeners una sola vez.
var installed = false
export function installPrefsListener() {
  if (installed || typeof window === 'undefined') return
  installed = true
  applyPrefs()
  window.addEventListener('akira-prefs-change', applyPrefs)
  if (window.matchMedia) {
    try { window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyPrefs) } catch (_) { /* Safari viejo */ }
  }
}

