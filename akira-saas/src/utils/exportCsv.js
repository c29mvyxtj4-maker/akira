/**
 * Exportación a CSV — genera y descarga un archivo en el navegador.
 * Sin dependencias ni backend. Compatible con Excel (incluye BOM UTF-8).
 */

function escapeCell(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Entrecomillar si contiene separador, comillas o saltos de línea.
  if (/[",\n\r;]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

/**
 * Descarga `rows` como CSV.
 * @param {string} filename  Nombre del archivo (se añade .csv si falta).
 * @param {Array<{key: string, label: string}>} columns  Columnas a exportar.
 * @param {Array<Object>} rows  Datos; cada fila es un objeto.
 */
export function exportToCsv(filename, columns, rows) {
  const header = columns.map(c => escapeCell(c.label)).join(',')
  const body = (rows || [])
    .map(row => columns.map(c => escapeCell(row[c.key])).join(','))
    .join('\r\n')

  // BOM (U+FEFF) para que Excel detecte UTF-8 (acentos, €). Escape explícito
  // para que no se pierda al guardar el archivo fuente.
  const csv = '﻿' + header + '\r\n' + body

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
