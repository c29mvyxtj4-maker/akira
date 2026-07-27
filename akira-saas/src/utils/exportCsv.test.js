import { describe, it, expect } from 'vitest'
import { buildCsv } from './exportCsv'

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'total', label: 'Total' },
]

describe('buildCsv', () => {
  it('genera cabecera y filas separadas por CRLF, con BOM', () => {
    const csv = buildCsv(columns, [
      { name: 'Ana', total: 100 },
      { name: 'Luis', total: 250 },
    ])
    expect(csv.charCodeAt(0)).toBe(0xfeff) // BOM
    const lines = csv.slice(1).split('\r\n')
    expect(lines[0]).toBe('Nombre,Total')
    expect(lines[1]).toBe('Ana,100')
    expect(lines[2]).toBe('Luis,250')
  })

  it('entrecomilla y escapa valores con comas, comillas o saltos de línea', () => {
    const csv = buildCsv(columns, [
      { name: 'Pérez, S.L.', total: '1"000' },
      { name: 'Línea\nnueva', total: 0 },
    ])
    const lines = csv.slice(1).split('\r\n')
    expect(lines[1]).toBe('"Pérez, S.L.","1""000"')
    expect(lines[2]).toBe('"Línea\nnueva",0')
  })

  it('trata null/undefined como celda vacía y acepta rows vacío', () => {
    expect(buildCsv(columns, [{ name: null, total: undefined }]).slice(1).split('\r\n')[1]).toBe(',')
    expect(buildCsv(columns, []).slice(1)).toBe('Nombre,Total\r\n')
    expect(buildCsv(columns, null).slice(1)).toBe('Nombre,Total\r\n')
  })
})
