import { describe, it, expect } from 'vitest'
import { buildInvoiceReminderMailto } from './useNotifications'

const company = { company_name: 'AKIRA' }

describe('buildInvoiceReminderMailto', () => {
  it('devuelve null si el cliente no tiene email', () => {
    expect(buildInvoiceReminderMailto({ clients: {} }, company)).toBeNull()
    expect(buildInvoiceReminderMailto({ clients: { email: '' } }, company)).toBeNull()
  })

  it('construye un mailto con asunto y cuerpo codificados', () => {
    const url = buildInvoiceReminderMailto(
      {
        invoice_number: 'F-2026-001',
        total: 1234.5,
        due_date: '2026-06-01',
        clients: { name: 'Ana Pérez', email: 'ana@example.com' },
      },
      company,
    )
    expect(url.startsWith('mailto:ana%40example.com?')).toBe(true)
    expect(url).toContain('subject=')
    expect(url).toContain('body=')
    // El asunto incluye el número de factura (codificado).
    expect(decodeURIComponent(url)).toContain('Factura F-2026-001')
    // Usa solo el primer nombre en el saludo.
    expect(decodeURIComponent(url)).toContain('Hola Ana,')
  })
})
