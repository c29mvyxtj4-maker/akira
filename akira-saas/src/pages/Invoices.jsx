import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, FileText, Archive, ChevronLeft,
  Building2, Wrench, Download, CreditCard, Eye, EyeOff,
} from 'lucide-react'
import { exportToCsv } from '@/utils/exportCsv'
import {
  getInvoices, getInvoiceById, createInvoice, updateInvoice,
  updateInvoiceStatus, archiveInvoice, INVOICE_STATUS,
} from '@/services/invoices.service'
import { getCompanySettings } from '@/services/company.service'
import { getServicesForSelect } from '@/services/subscriptions.service'
import { downloadInvoicePdf } from '@/utils/generateInvoicePdf'
import { supabase } from '@/lib/supabase'
import PageHeader   from '@/components/layout/PageHeader'
import Badge        from '@/components/ui/Badge'
import Button        from '@/components/ui/Button'
import EmptyState   from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { SkeletonTableRow } from '@/components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
function makeItemId() { return 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

/* ── Editor de factura (cuadricula de lineas) ─────────────── */
function InvoiceEditor({ initial, clients, defaultTaxRate, onSave, onCancel, loading }) {
  var today = new Date().toISOString().split('T')[0]

  var [clientId,  setClientId]  = useState(initial ? (initial.client_id || '') : '')
  var [issueDate, setIssueDate] = useState(initial ? initial.issue_date : today)
  var [dueDate,   setDueDate]   = useState(initial ? (initial.due_date || '') : '')
  var [taxRate,   setTaxRate]   = useState(initial ? initial.tax_rate : defaultTaxRate)
  var [notes,     setNotes]     = useState(initial ? (initial.notes || '') : '')
  var [items,     setItems]     = useState(function() {
    if (initial && Array.isArray(initial.items) && initial.items.length > 0) return initial.items
    return [{ id: makeItemId(), description: '', quantity: 1, price: 0 }]
  })

  // Servicios activos, para poder anadirlos como linea con un clic — NUEVO
  var [services, setServices] = useState([])
  useEffect(function() {
    getServicesForSelect().then(setServices).catch(function() { setServices([]) })
  }, [])

  function updateItem(id, field, value) {
    setItems(function(prev) {
      return prev.map(function(it) { return it.id === id ? Object.assign({}, it, { [field]: value }) : it })
    })
  }

  function addItem(prefill) {
    setItems(function(prev) {
      return prev.concat([{
        id: makeItemId(),
        description: (prefill && prefill.description) || '',
        quantity: 1,
        price: (prefill && prefill.price) || 0,
      }])
    })
  }

  function addFromService(e) {
    var serviceId = e.target.value
    e.target.value = '' // reseteamos el selector para poder volver a usarlo
    if (!serviceId) return
    var s = services.find(function(x) { return x.id === serviceId })
    if (!s) return
    addItem({ description: s.name, price: s.price })
  }

  function removeItem(id) {
    setItems(function(prev) { return prev.length > 1 ? prev.filter(function(it) { return it.id !== id }) : prev })
  }

  var subtotal  = items.reduce(function(s, it) { return s + (Number(it.quantity) || 0) * (Number(it.price) || 0) }, 0)
  var taxAmount = subtotal * ((Number(taxRate) || 0) / 100)
  var total     = subtotal + taxAmount

  function handleSubmit(e) {
    e.preventDefault()
    var cleanItems = items.filter(function(it) { return it.description.trim() })
    if (cleanItems.length === 0) return
    onSave({
      client_id:  clientId,
      issue_date: issueDate,
      due_date:   dueDate,
      tax_rate:   taxRate,
      notes:      notes,
      items:      cleanItems,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label className="label-base">Cliente</label>
          <select value={clientId} onChange={function(e) { setClientId(e.target.value) }} style={INP}>
            <option value="">Sin cliente</option>
            {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}{c.company ? ' — ' + c.company : ''}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Fecha de emision</label>
          <input type="date" value={issueDate} onChange={function(e) { setIssueDate(e.target.value) }} style={INP} />
        </div>
        <div>
          <label className="label-base">Fecha de vencimiento</label>
          <input type="date" value={dueDate} onChange={function(e) { setDueDate(e.target.value) }} style={INP} />
        </div>
      </div>

      {/* Cuadricula de lineas */}
      <div>
        <label className="label-base">Lineas de la factura</label>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px 36px', gap: 0, background: 'rgba(255,255,255,0.03)', padding: '8px 10px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Concepto</span>
            <span>Cantidad</span>
            <span>Precio</span>
            <span>Total</span>
            <span></span>
          </div>
          {items.map(function(it, i) {
            var lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
            return (
              <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px 36px', gap: '8px', padding: '8px 10px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                <input value={it.description} onChange={function(e) { updateItem(it.id, 'description', e.target.value) }} placeholder="Descripcion del servicio..." style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <input type="number" min="0" step="1" value={it.quantity} onChange={function(e) { updateItem(it.id, 'quantity', e.target.value) }} style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <input type="number" min="0" step="0.01" value={it.price} onChange={function(e) { updateItem(it.id, 'price', e.target.value) }} style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', textAlign: 'right', paddingRight: '4px' }}>{fmtCur(lineTotal)}</span>
                <button type="button" onClick={function() { removeItem(it.id) }}
                  style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={function() { addItem() }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '7px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus style={{ width: '13px', height: '13px' }} /> Linea en blanco
          </button>

          {services.length > 0 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Wrench style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.3)', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
              <select defaultValue="" onChange={addFromService}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '7px', fontSize: '12px', padding: '6px 10px 6px 28px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value="">+ Añadir servicio...</option>
                {services.map(function(s) {
                  return <option key={s.id} value={s.id}>{s.name} — {fmtCur(s.price)}</option>
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', alignItems: 'start' }}>
        <div>
          <label className="label-base">Notas (opcional)</label>
          <textarea value={notes} onChange={function(e) { setNotes(e.target.value) }} rows={3} placeholder="Condiciones de pago, agradecimiento..." style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            <span>Subtotal</span><span>{fmtCur(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              IVA
              <input type="number" min="0" step="0.1" value={taxRate} onChange={function(e) { setTaxRate(e.target.value) }}
                style={{ width: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '5px', fontSize: '11px', padding: '2px 4px', textAlign: 'center' }}
              />%
            </span>
            <span>{fmtCur(taxAmount)}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, color: '#e63946' }}>
            <span>Total</span><span>{fmtCur(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear factura'}</Button>
      </div>
    </form>
  )
}

/* ── Vista previa de la factura ───────────────────────────── */
function InvoicePreview({ invoice, company, onBack }) {
  var items = Array.isArray(invoice.items) ? invoice.items : []
  var client = invoice.clients
  var [downloading, setDownloading] = useState(false)
  var [charging, setCharging] = useState(false)
  var canCharge = invoice.status !== 'paid' && invoice.status !== 'void'

  function handleDownload() {
    setDownloading(true)
    downloadInvoicePdf(invoice, company)
      .catch(function(e) { window.alert('Error al generar el PDF: ' + e.message) })
      .finally(function() { setDownloading(false) })
  }

  async function handleCharge() {
    setCharging(true)
    try {
      var res = await supabase.functions.invoke('create-checkout', { body: { invoice_id: invoice.id } })
      if (res.error) throw res.error
      var url = res.data && res.data.url
      if (!url) throw new Error((res.data && res.data.error) || 'No se recibió el enlace de pago')
      try { await navigator.clipboard.writeText(url) } catch (_) { /* sin permiso de portapapeles */ }
      window.open(url, '_blank')
    } catch (e) {
      window.alert('No se pudo generar el cobro: ' + (e.message || e))
    } finally {
      setCharging(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button type="button" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer' }}
        ><ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver a facturas</button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {canCharge && (
            <button type="button" onClick={handleCharge} disabled={charging}
              onMouseEnter={function (e) { if (!charging) e.currentTarget.style.boxShadow = '0 0 18px 1px rgba(34,197,94,0.4)' }}
              onMouseLeave={function (e) { e.currentTarget.style.boxShadow = 'none' }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', fontSize: '13px', fontWeight: 700, cursor: charging ? 'not-allowed' : 'pointer', opacity: charging ? 0.7 : 1, transition: 'box-shadow 0.2s' }}
            >{charging ? 'Generando enlace...' : 'Cobrar'}</button>
          )}
          <button type="button" onClick={handleDownload} disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}
          >{downloading ? 'Generando...' : 'Descargar PDF'}</button>
        </div>
      </div>

      <div style={{ background: '#ffffff', color: '#1a1a1a', borderRadius: '12px', padding: '48px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            {company.logo_url ? (
              <img src={company.logo_url} alt="Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e63946', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Building2 style={{ width: '24px', height: '24px', color: '#fff' }} />
              </div>
            )}
            <p style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{company.company_name || 'Tu empresa'}</p>
            {company.tax_id && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>NIF: {company.tax_id}</p>}
            {company.address && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>{company.address}</p>}
            {(company.postal_code || company.city) && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>{company.postal_code} {company.city}</p>}
            {company.email && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>{company.email}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>FACTURA</h1>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#e63946', margin: '4px 0' }}>{invoice.invoice_number}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>Emisión: {fmtDate(invoice.issue_date)}</p>
            {invoice.due_date && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>Vencimiento: {fmtDate(invoice.due_date)}</p>}
          </div>
        </div>

        {/* Cliente */}
        <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#f8f8fb', borderRadius: '10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Facturar a</p>
          <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{client ? (client.company || client.name) : 'Sin cliente'}</p>
          {client && client.name && client.company && <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>{client.name}</p>}
          {client && client.email && <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>{client.email}</p>}
        </div>

        {/* Tabla de lineas */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Concepto</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Precio</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(function(it, i) {
              return (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 4px', fontSize: '13px' }}>{it.description}</td>
                  <td style={{ padding: '10px 4px', fontSize: '13px', textAlign: 'right' }}>{it.quantity}</td>
                  <td style={{ padding: '10px 4px', fontSize: '13px', textAlign: 'right' }}>{fmtCur(it.price)}</td>
                  <td style={{ padding: '10px 4px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>{fmtCur((Number(it.quantity) || 0) * (Number(it.price) || 0))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>Subtotal</span><span>{fmtCur(invoice.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>IVA ({invoice.tax_rate}%)</span><span>{fmtCur(invoice.tax_amount)}</span>
            </div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900 }}>
              <span>Total</span><span>{fmtCur(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>Notas</p>
            <p style={{ fontSize: '12px', color: '#666', whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════════════ */
export default function Invoices() {
  var [invoices,   setInvoices]   = useState([])
  var [company,    setCompany]    = useState(null)
  var [clients,    setClients]    = useState([])
  var [loading,    setLoading]    = useState(true)
  var [modalOpen,  setModalOpen]  = useState(false)
  var [editing,    setEditing]    = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [previewing, setPreviewing] = useState(null)
  var [chargingId, setChargingId] = useState(null)
  var [toastMsg,   setToastMsg]   = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  var loadAll = useCallback(function() {
    setLoading(true)
    Promise.all([
      getInvoices(),
      getCompanySettings(),
      supabase.from('clients').select('id, name, company').eq('archived', false).order('name'),
    ]).then(function(results) {
      setInvoices(results[0])
      setCompany(results[1])
      setClients((results[2].data) || [])
    }).catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { loadAll() }, [loadAll])

  // Abrir directamente una factura si venimos de la busqueda global — NUEVO
  var [searchParams] = useSearchParams()
  useEffect(function() {
    var openId = searchParams.get('open')
    if (openId) {
      getInvoiceById(openId).then(setPreviewing).catch(function() {})
    }
  }, [searchParams])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(inv) { setEditing(inv); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleExport() {
    if (!invoices.length) return
    var columns = [
      { key: 'number',      label: 'Número' },
      { key: 'client',      label: 'Cliente' },
      { key: 'issue_date',  label: 'Emisión' },
      { key: 'due_date',    label: 'Vencimiento' },
      { key: 'total',       label: 'Total (€)' },
      { key: 'status_label',label: 'Estado' },
    ]
    var rows = invoices.map(function(inv) {
      var sc = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft
      return {
        number:       inv.invoice_number || '',
        client:       inv.clients ? (inv.clients.company || inv.clients.name) : '',
        issue_date:   inv.issue_date || '',
        due_date:     inv.due_date || '',
        total:        Number(inv.total) || 0,
        status_label: sc.label,
      }
    })
    exportToCsv('facturas_' + new Date().toISOString().slice(0, 10), columns, rows)
  }

  function handleSave(form) {
    setFormLoading(true)
    var promise = editing ? updateInvoice(editing.id, form) : createInvoice(form)
    promise
      .then(function(saved) {
        if (editing) {
          setInvoices(function(prev) { return prev.map(function(i) { return i.id === saved.id ? saved : i }) })
          showToast('Factura actualizada')
        } else {
          setInvoices(function(prev) { return [saved].concat(prev) })
          showToast('Factura ' + saved.invoice_number + ' creada')
          getCompanySettings().then(setCompany).catch(function() {})
        }
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleStatusChange(id, status) {
    var prev = invoices.find(function(i) { return i.id === id })
    var wasDraft = prev && prev.status === 'draft'
    updateInvoiceStatus(id, status)
      .then(function(updated) {
        setInvoices(function(list) { return list.map(function(i) { return i.id === updated.id ? updated : i }) })
        // Al pasar de borrador a enviada, mandar la factura al cliente por email.
        if (wasDraft && status === 'sent') sendInvoiceEmail(id)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function sendInvoiceEmail(id) {
    showToast('Enviando factura al cliente…')
    supabase.functions.invoke('send-invoice', { body: { invoice_id: id } })
      .then(function(res) {
        var err = (res.error && res.error.message) || (res.data && res.data.error)
        if (err) throw new Error(err)
        showToast('Factura enviada al cliente por email')
      })
      .catch(function(e) { showToast('No se pudo enviar el email: ' + (e.message || e), 'error') })
  }

  async function handleCharge(inv) {
    if (chargingId) return
    setChargingId(inv.id)
    showToast('Generando enlace de cobro…')
    try {
      var res = await supabase.functions.invoke('create-checkout', { body: { invoice_id: inv.id } })
      if (res.error) throw res.error
      var url = res.data && res.data.url
      if (!url) throw new Error((res.data && res.data.error) || 'No se recibió el enlace de pago')
      try { await navigator.clipboard.writeText(url) } catch (_) { /* sin permiso de portapapeles */ }
      window.open(url, '_blank')
      showToast('Enlace de cobro listo (copiado al portapapeles)')
    } catch (e) {
      showToast('No se pudo generar el cobro: ' + (e.message || e), 'error')
    } finally {
      setChargingId(null)
    }
  }

  function handleArchive(id) {
    if (!window.confirm('Archivar esta factura?')) return
    archiveInvoice(id)
      .then(function() {
        setInvoices(function(prev) { return prev.filter(function(i) { return i.id !== id }) })
        showToast('Factura archivada')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function openPreview(inv) {
    getInvoiceById(inv.id).then(setPreviewing).catch(function(e) { showToast(e.message, 'error') })
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader
          title="Facturas"
          description="Cargando..."
          actions={<Button icon={<Plus className="w-4 h-4" />} disabled>Nueva factura</Button>}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="surface-card overflow-x-auto">
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTableRow key={i} columns={6} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (previewing) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <InvoicePreview invoice={previewing} company={company} onBack={function() { setPreviewing(null) }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Facturas"
        description={invoices.length + ' factura' + (invoices.length !== 1 ? 's' : '')}
        actions={<>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport} disabled={!invoices.length}>Exportar CSV</Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nueva factura</Button>
        </>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {!company || !company.company_name ? (
          <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#f59e0b' }}>
            Todavia no has rellenado tus datos fiscales. Ve a Configuracion → Facturacion antes de crear tu primera factura.
          </div>
        ) : null}

        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            emoji="📄"
            title="Sin facturas todavia"
            description="Crea tu primera factura para empezar a facturar a tus clientes."
            actionShortcut="Cmd+N"
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Nueva factura</Button>}
          />
        ) : (
          <div className="surface-card overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Número', 'Cliente', 'Emisión', 'Total', 'Estado', 'Acciones'].map(function(h, hi) {
                    var isActions = hi === 5
                    return <th key={h} style={{ padding: '10px 14px', textAlign: isActions ? 'right' : 'left', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', position: isActions ? 'sticky' : undefined, right: isActions ? 0 : undefined, background: isActions ? 'var(--bg-2)' : undefined }}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {invoices.map(function(inv) {
                  var sc = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <button type="button" onClick={function() { openPreview(inv) }}
                          style={{ background: 'none', border: 'none', color: '#e63946', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
                        >{inv.invoice_number}</button>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                          {inv.clients ? (inv.clients.company || inv.clients.name) : '--'}
                        </div>
                        {inv.clients && (
                          (inv.status === 'sent' || inv.status === 'paid') ? (
                            <div title="El cliente ve esta factura en su portal" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px', fontWeight: 600, color: '#22c55e' }}>
                              <Eye style={{ width: '11px', height: '11px' }} /> Visible en portal
                            </div>
                          ) : (
                            <div title="En borrador: solo tú la ves. Pásala a Enviada para que el cliente la reciba y la vea en el portal." style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px', fontWeight: 600, color: 'var(--text-5)' }}>
                              <EyeOff style={{ width: '11px', height: '11px' }} /> Solo tú (borrador)
                            </div>
                          )
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>{fmtDate(inv.issue_date)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{fmtCur(inv.total)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <select value={inv.status} onChange={function(e) { handleStatusChange(inv.id, e.target.value) }}
                          style={{ background: sc.color + '18', border: '1px solid ' + sc.color + '44', color: sc.color, borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', cursor: 'pointer', outline: 'none' }}
                        >
                          {Object.entries(INVOICE_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px', position: 'sticky', right: 0, background: 'var(--bg-2)', boxShadow: '-10px 0 12px -8px rgba(0,0,0,0.55)' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          {inv.status !== 'paid' && inv.status !== 'void' && (
                            <button type="button" onClick={function() { handleCharge(inv) }} disabled={chargingId === inv.id}
                              title="Generar enlace de cobro"
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 10px', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '12px', fontWeight: 700, cursor: chargingId === inv.id ? 'not-allowed' : 'pointer', opacity: chargingId === inv.id ? 0.6 : 1, whiteSpace: 'nowrap' }}
                            >
                              <CreditCard style={{ width: '13px', height: '13px' }} />
                              {chargingId === inv.id ? 'Generando…' : 'Cobrar'}
                            </button>
                          )}
                          <button type="button" onClick={function() { openEdit(inv) }}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: '#94a3b8' }}
                          >✎</button>
                          <button type="button" onClick={function() { handleArchive(inv.id) }}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          ><Archive style={{ width: '13px', height: '13px' }} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && company && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: '720px' }} onClick={function(e) { e.stopPropagation() }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{editing ? 'Editar factura' : 'Nueva factura'}</h3>
              </div>
            </div>
            <div className="modal-body">
              <InvoiceEditor
                initial={editing}
                clients={clients}
                defaultTaxRate={company.default_tax_rate || 21}
                onSave={handleSave}
                onCancel={closeModal}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toastMsg.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}
          >{toastMsg.msg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}