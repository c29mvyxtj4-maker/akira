import { useState, useCallback } from 'react'

/*
 * Preferencias de UI ligeras persistidas en localStorage (atajos, privacidad,
 * apariencia…). Son opciones puramente de cliente que no necesitan backend.
 * Para datos reales (perfil, workspace, equipo) se usan los servicios Supabase.
 */
var KEY = 'akira-prefs'

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (_) { return {} }
}

export function getPref(key, fallback) {
  var all = readAll()
  return key in all ? all[key] : fallback
}

export function usePrefs(defaults) {
  var [prefs, setPrefs] = useState(function () { return Object.assign({}, defaults, readAll()) })

  var setPref = useCallback(function (key, value) {
    setPrefs(function (prev) {
      var patch = typeof key === 'object' ? key : {}
      if (typeof key !== 'object') patch[key] = value
      var next = Object.assign({}, prev, patch)
      try { localStorage.setItem(KEY, JSON.stringify(Object.assign(readAll(), next))) } catch (_) { /* noop */ }
      try { window.dispatchEvent(new CustomEvent('akira-prefs-change', { detail: patch })) } catch (_) { /* noop */ }
      return next
    })
  }, [])

  return [prefs, setPref]
}
