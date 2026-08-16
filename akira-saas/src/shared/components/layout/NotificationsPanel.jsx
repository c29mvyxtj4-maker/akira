import { AlertTriangle, UserX, CheckCircle, X } from 'lucide-react'
import { buildInvoiceReminderMailto } from '@/shared/hooks/useNotifications'
import { getCompanySettings } from '@/services/company.service'
import { useState, useEffect } from 'react'

function fmtCur(n) {
  return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '–‚¬'
}
function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
function daysAgo(d) {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

export default function NotificationsPanel({ overdueInvoices, staleClients, urgentTasks, onClose }) {
  var [company, setCompany] = useState(null)

  useEffect(function() {
    getCompanySettings().then(setCompany).catch(function() {})
  }, [])

  function handleSendReminder(invoice) {
    var url = buildInvoiceReminderMailto(invoice, company || {})
    if (!url) {
      window.alert('Este cliente no tiene email guardado.')
      return
    }
    window.location.href = url
  }

  var invoices = overdueInvoices || []
  var clients  = staleClients   || []
  var tasks    = urgentTasks    || []
  var hasAnything = invoices.length > 0 || clients.length > 0 || tasks.length > 0

  return (
    <div
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '340px', maxWidth: '90vw',
        maxHeight: '70vh', overflowY: 'auto',
        background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px',
        boxShadow: 'var(--shadow-modal)', zIndex: 300,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>Notificaciones</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex' }}>
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      {!hasAnything ? (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <CheckCircle style={{ width: '28px', height: '28px', color: 'var(--text-5)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-4)' }}>Todo al día, sin avisos pendientes</p>
        </div>
      ) : (
        <div style={{ padding: '8px' }}>

          {/* Facturas vencidas */}
          {invoices.map(function(inv) {
            var client = inv.clients
            return (
              <div key={'inv-' + inv.id} style={{ padding: '10px 10px', borderRadius: '8px', marginBottom: '4px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertTriangle style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>
                      Factura vencida: {inv.invoice_number}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>
                      {client ? (client.company || client.name) : 'Sin cliente'} · {fmtCur(inv.total)} · venció el {fmtDate(inv.due_date)}
                    </p>
                    <button type="button" onClick={function() { handleSendReminder(inv) }}
                      style={{ marginTop: '6px', fontSize: '11px', fontWeight: 600, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >Enviar recordatorio por email –†’</button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Clientes sin contacto */}
          {clients.map(function(c) {
            var d = daysAgo(c.last_contact_at)
            return (
              <div key={'cli-' + c.id} style={{ padding: '10px 10px', borderRadius: '8px', marginBottom: '4px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <UserX style={{ width: '14px', height: '14px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>
                      {c.company || c.name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>
                      {d === null ? 'Nunca contactado' : 'Sin contacto desde hace ' + d + ' días'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Tareas urgentes */}
          {tasks.map(function(t, i) {
            return (
              <div key={'task-' + i} style={{ padding: '10px 10px', borderRadius: '8px', marginBottom: '4px', background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertTriangle style={{ width: '14px', height: '14px', color: '#e63946', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>{t.text}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{t.projectName || 'Tarea urgente'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
