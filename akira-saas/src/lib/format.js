import { getPref } from '@/hooks/usePreferences'

/*
 * Formateo de números y fechas según las preferencias del usuario
 * (pref_number_format, pref_date_format). Centralizado para que las pantallas
 * puedan adoptarlo progresivamente.
 */
export function numberLocale() { return getPref('pref_number_format', 'es-ES') || 'es-ES' }

export function fmtNumber(n, opts) {
  return (Number(n) || 0).toLocaleString(numberLocale(), opts)
}

export function fmtEuro(n) {
  return fmtNumber(n, { maximumFractionDigits: 0 }) + '€'
}

export function dateLocale() {
  var f = getPref('pref_date_format', 'dmy')
  if (f === 'mdy') return 'en-US'   // MM/DD/AAAA
  if (f === 'ymd') return 'sv-SE'   // AAAA-MM-DD
  return 'es-ES'                    // DD/MM/AAAA
}

export function fmtDate(d, opts) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(dateLocale(), opts || { day: '2-digit', month: 'short', year: 'numeric' })
}
