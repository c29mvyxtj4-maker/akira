import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, FileText, FileSignature, Archive, ChevronLeft, Building2, ArrowRightCircle, Wrench, CreditCard } from 'lucide-react'
import {
  getDocuments, getDocumentById, createQuote, createInvoiceDirect, updateDocument,
  updateDocumentStatus, archiveDocument, convertToInvoice,
  getSelectorsForDocuments, QUOTE_STATUS, INVOICE_STATUS,
} from '@/services/documents.service'
import { getCompanySettings } from '@/services/company.service'
import { getServicesForSelect } from '@/services/subscriptions.service'
import { downloadDocumentPdf } from '@/utils/generateDocumentPdf'
import { supabase } from '@/lib/supabase'
import PageHeader   from '@/components/layout/PageHeader'
import Button        from '@/components/ui/Button'
import EmptyState   from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import clsx from 'clsx'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
function makeItemId() { return 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

/* ── Editor (comun a presupuesto y factura directa) ───────── */
function DocumentEditor({ initial, docType, clients, defaultTaxRate, defaultIrpfRate, onSave, onCancel, loading }) {
  var today = new Date().toISOString().split('T')[0]
  var isQuote = docType === 'quote'

  var [clientId,   setClientId]   = useState(initial ? (initial.client_id || '') : '')
  var [issueDate,  setIssueDate]  = useState(initial ? initial.issue_date : today)
  var [secondDate, setSecondDate] = useState(initial ? ((isQuote ? initial.valid_until : initial.due_date) || '') : '')
  var [taxRate,    setTaxRate]    = useState(initial ? initial.tax_rate : defaultTaxRate)
  var [irpfRate,   setIrpfRate]   = useState(initial ? (initial.irpf_rate || 0) : defaultIrpfRate) // ← NUEVO
  var [notes,      setNotes]      = useState(initial ? (initial.notes || '') : '')
  var [items, setItems] = useState(function() {
    if (initial && Array.isArray(initial.items) && initial.items.length > 0) return initial.items
    return [{ id: makeItemId(), description: '', quantity: 1, price: 0 }]
  })

  var [services, setServices] = useState([])
  useEffect(function() { getServicesForSelect().then(setServices).catch(function() { setServices([]) }) }, [])

  function updateItem(id, field, value) { setItems(function(prev) { return prev.map(function(it) { return it.id === id ? Object.assign({}, it, { [field]: value }) : it }) }) }
  function addItem(prefill) {
    setItems(function(prev) { return prev.concat([{ id: makeItemId(), description: (prefill && prefill.description) || '', quantity: 1, price: (prefill && prefill.price) || 0 }]) })
  }
  function addFromService(e) {
    var sid = e.target.value; e.target.value = ''
    if (!sid) return
    var s = services.find(function(x) { return x.id === sid })
    if (s) addItem({ description: s.name, price: s.price })
  }
  function removeItem(id) { setItems(function(prev) { return prev.length > 1 ? prev.filter(function(it) { return it.id !== id }) : prev }) }

  var subtotal   = items.reduce(function(s, it) { return s + (Number(it.quantity) || 0) * (Number(it.price) || 0) }, 0)
  var taxAmount  = subtotal * ((Number(taxRate) || 0) / 100)
  var irpfAmount = subtotal * ((Number(irpfRate) || 0) / 100) // ← NUEVO
  var total      = subtotal + taxAmount - irpfAmount

  function handleSubmit(e) {
    e.preventDefault()
    var cleanItems = items.filter(function(it) { return it.description.trim() })
    if (cleanItems.length === 0) return
    var form = { client_id: clientId, issue_date: issueDate, tax_rate: taxRate, irpf_rate: irpfRate, notes: notes, items: cleanItems, document_type: docType }
    if (isQuote) form.valid_until = secondDate
    else form.due_date = secondDate
    onSave(form)
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
          <label className="label-base">{isQuote ? 'Valido hasta' : 'Fecha de vencimiento'}</label>
          <input type="date" value={secondDate} onChange={function(e) { setSecondDate(e.target.value) }} style={INP} />
        </div>
      </div>

      <div>
        <label className="label-base">Lineas</label>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px 36px', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Concepto</span><span>Cantidad</span><span>Precio</span><span>Total</span><span></span>
          </div>
          {items.map(function(it, i) {
            var lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
            return (
              <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px 36px', gap: '8px', padding: '8px 10px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                <input value={it.description} onChange={function(e) { updateItem(it.id, 'description', e.target.value) }} placeholder="Descripcion..." style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <input type="number" min="0" step="1" value={it.quantity} onChange={function(e) { updateItem(it.id, 'quantity', e.target.value) }} style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <input type="number" min="0" step="0.01" value={it.price} onChange={function(e) { updateItem(it.id, 'price', e.target.value) }} style={Object.assign({}, INP, { padding: '6px 8px' })} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', textAlign: 'right', paddingRight: '4px' }}>{fmtCur(lineTotal)}</span>
                <button type="button" onClick={function() { removeItem(it.id) }} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 style={{ width: '13px', height: '13px' }} /></button>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={function() { addItem() }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '7px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}><Plus style={{ width: '13px', height: '13px' }} /> Linea en blanco</button>
          {services.length > 0 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Wrench style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.3)', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
              <select defaultValue="" onChange={addFromService} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '7px', fontSize: '12px', padding: '6px 10px 6px 28px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="">+ Añadir servicio...</option>
                {services.map(function(s) { return <option key={s.id} value={s.id}>{s.name} — {fmtCur(s.price)}</option> })}
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '16px', alignItems: 'start' }}>
        <div>
          <label className="label-base">Notas (opcional)</label>
          <textarea value={notes} onChange={function(e) { setNotes(e.target.value) }} rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}><span>Subtotal</span><span>{fmtCur(subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>IVA
              <input type="number" min="0" step="0.1" value={taxRate} onChange={function(e) { setTaxRate(e.target.value) }} style={{ width: '46px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '5px', fontSize: '11px', padding: '2px 4px', textAlign: 'center' }} />%
            </span>
            <span>+{fmtCur(taxAmount)}</span>
          </div>
          {/* ← NUEVO: linea de retencion IRPF */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Retencion IRPF
              <input type="number" min="0" step="0.1" value={irpfRate} onChange={function(e) { setIrpfRate(e.target.value) }} style={{ width: '46px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '5px', fontSize: '11px', padding: '2px 4px', textAlign: 'center' }} />%
            </span>
            <span>-{fmtCur(irpfAmount)}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, color: '#e63946' }}><span>Total</span><span>{fmtCur(total)}</span></div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : (isQuote ? 'Crear presupuesto' : 'Crear factura')}</Button>
      </div>
    </form>
  )
}

/* ── Vista previa ──────────────────────────────────────────── */
function DocumentPreview({ doc, company, onBack, onConvert, converting }) {
  var isQuote = doc.document_type === 'quote'
  var items = Array.isArray(doc.items) ? doc.items : []
  var client = doc.clients
  var [downloading, setDownloading] = useState(false)
  var [charging, setCharging] = useState(false)
  // Solo facturas no pagadas/anuladas se pueden cobrar.
  var canCharge = !isQuote && doc.status !== 'paid' && doc.status !== 'void'

  function handleDownload() {
    setDownloading(true)
    downloadDocumentPdf(doc, company).catch(function(e) { window.alert('Error al generar el PDF: ' + e.message) }).finally(function() { setDownloading(false) })
  }

  async function handleCharge() {
    setCharging(true)
    try {
      var res = await supabase.functions.invoke('create-checkout', { body: { invoice_id: doc.id, return_path: '/documents' } })
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer' }}><ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver a documentos</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canCharge && (
            <button type="button" onClick={handleCharge} disabled={charging}
              onMouseEnter={function (e) { if (!charging) e.currentTarget.style.boxShadow = '0 0 18px 1px rgba(34,197,94,0.4)' }}
              onMouseLeave={function (e) { e.currentTarget.style.boxShadow = 'none' }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', fontSize: '13px', fontWeight: 700, cursor: charging ? 'not-allowed' : 'pointer', opacity: charging ? 0.7 : 1, transition: 'box-shadow 0.2s' }}><CreditCard style={{ width: '15px', height: '15px' }} /> {charging ? 'Generando enlace...' : 'Cobrar'}</button>
          )}
          {isQuote && doc.status === 'accepted' && (
            <button type="button" onClick={onConvert} disabled={converting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#22c55e', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: converting ? 'not-allowed' : 'pointer' }}><ArrowRightCircle style={{ width: '15px', height: '15px' }} /> {converting ? 'Convirtiendo...' : 'Convertir en factura'}</button>
          )}
          <button type="button" onClick={handleDownload} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer' }}>{downloading ? 'Generando...' : 'Descargar PDF'}</button>
        </div>
      </div>

      {!isQuote && doc.quote_number && (
        <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', color: '#22c55e' }}>
          Esta factura nacio del presupuesto {doc.quote_number}.
        </div>
      )}

      <div style={{ background: '#ffffff', color: '#1a1a1a', borderRadius: '12px', padding: '48px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            {company.logo_url ? <img src={company.logo_url} alt="Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} /> : (
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e63946', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><Building2 style={{ width: '24px', height: '24px', color: '#fff' }} /></div>
            )}
            <p style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{company.company_name || 'Tu empresa'}</p>
            {company.tax_id && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>NIF: {company.tax_id}</p>}
            {company.email && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>{company.email}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{isQuote ? 'PRESUPUESTO' : 'FACTURA'}</h1>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#e63946', margin: '4px 0' }}>{isQuote ? doc.quote_number : doc.invoice_number}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>Emision: {fmtDate(doc.issue_date)}</p>
          </div>
        </div>
        <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#f8f8fb', borderRadius: '10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{isQuote ? 'Para' : 'Facturar a'}</p>
          <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{client ? (client.company || client.name) : 'Sin cliente'}</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead><tr style={{ borderBottom: '2px solid #1a1a1a' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Concepto</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Cant.</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Precio</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
          </tr></thead>
          <tbody>
            {items.map(function(it, i) { return (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 4px', fontSize: '13px' }}>{it.description}</td>
                <td style={{ padding: '10px 4px', fontSize: '13px', textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ padding: '10px 4px', fontSize: '13px', textAlign: 'right' }}>{fmtCur(it.price)}</td>
                <td style={{ padding: '10px 4px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>{fmtCur((Number(it.quantity) || 0) * (Number(it.price) || 0))}</td>
              </tr>
            )})}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}><span style={{ color: '#666' }}>Subtotal</span><span>{fmtCur(doc.subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}><span style={{ color: '#666' }}>IVA ({doc.tax_rate}%)</span><span>+{fmtCur(doc.tax_amount)}</span></div>
            {doc.irpf_rate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}><span style={{ color: '#666' }}>Retencion IRPF ({doc.irpf_rate}%)</span><span>-{fmtCur(doc.irpf_amount)}</span></div>
            )}
            <div style={{ height: '1px', background: '#1a1a1a', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900 }}><span>Total</span><span>{fmtCur(doc.total)}</span></div>
          </div>
        </div>
        {doc.notes && (
          <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>Notas</p>
            <p style={{ fontSize: '12px', color: '#666', whiteSpace: 'pre-wrap' }}>{doc.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════════════ */
export default function Documents() {
  var [tab, setTab] = useState('quote') // 'quote' | 'invoice'
  var [documents, setDocuments] = useState([])
  var [company,   setCompany]   = useState(null)
  var [clients,   setClients]   = useState([])
  var [loading,   setLoading]   = useState(true)
  var [modalOpen, setModalOpen] = useState(false)
  var [editing,   setEditing]   = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [previewing,  setPreviewing]  = useState(null)
  var [converting,  setConverting]  = useState(false)
  var [toastMsg,    setToastMsg]    = useState(null)

  function showToast(msg, type) { setToastMsg({ msg: msg, type: type || 'success' }); setTimeout(function() { setToastMsg(null) }, 3500) }

  var loadAll = useCallback(function() {
    setLoading(true)
    Promise.all([getDocuments('all'), getCompanySettings(), getSelectorsForDocuments()])
      .then(function(results) { setDocuments(results[0]); setCompany(results[1]); setClients(results[2]) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { loadAll() }, [loadAll])

  useEffect(function() {
    var channel = supabase.channel('commercial-documents-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commercial_documents' }, function() { loadAll() })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [loadAll])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(doc) { setEditing(doc); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSave(form) {
    setFormLoading(true)
    var promise
    if (editing) promise = updateDocument(editing.id, form)
    else promise = tab === 'quote' ? createQuote(form) : createInvoiceDirect(form)

    promise
      .then(function(saved) {
        showToast(editing ? 'Documento actualizado' : 'Creado ' + (saved.quote_number || saved.invoice_number))
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleStatusChange(id, status) {
    updateDocumentStatus(id, status)
      .then(function(updated) { if (previewing && previewing.id === id) setPreviewing(updated) })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleArchive(id) {
    if (!window.confirm('Archivar este documento?')) return
    archiveDocument(id).then(function() { showToast('Documento archivado') }).catch(function(e) { showToast(e.message, 'error') })
  }

  function openPreview(doc) { getDocumentById(doc.id).then(setPreviewing).catch(function(e) { showToast(e.message, 'error') }) }

  function handleConvert() {
    if (!previewing) return
    setConverting(true)
    convertToInvoice(previewing.id)
      .then(function() { showToast('Convertido en factura'); return getDocumentById(previewing.id) })
      .then(setPreviewing)
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setConverting(false) })
  }

  var quotes   = documents.filter(function(d) { return d.document_type === 'quote' })
  var invoices = documents.filter(function(d) { return d.document_type === 'invoice' })
  var visible  = tab === 'quote' ? quotes : invoices

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><PageSpinner label="Cargando documentos..." /></div>

  if (previewing) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <DocumentPreview doc={previewing} company={company} onBack={function() { setPreviewing(null) }} onConvert={handleConvert} converting={converting} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Documentos"
        description={documents.length + ' documento' + (documents.length !== 1 ? 's' : '')}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>{tab === 'quote' ? 'Nuevo presupuesto' : 'Nueva factura'}</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {!company || !company.company_name ? (
          <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#f59e0b' }}>
            Todavia no has rellenado tus datos fiscales. Ve a Configuracion → Facturacion.
          </div>
        ) : null}

        <div className="flex gap-1 mb-5 bg-surface-3 rounded-lg p-1 w-fit">
          {[{ id: 'quote', label: 'Presupuestos (' + quotes.length + ')' }, { id: 'invoice', label: 'Facturas (' + invoices.length + ')' }].map(function(t) {
            return (
              <button key={t.id} type="button" onClick={function() { setTab(t.id) }}
                className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150', tab === t.id ? 'bg-surface-5 text-text-1 shadow-sm' : 'text-text-3 hover:text-text-2')}
              >{t.label}</button>
            )
          })}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={tab === 'quote' ? FileSignature : FileText}
            title={tab === 'quote' ? 'Sin presupuestos todavia' : 'Sin facturas todavia'}
            description={tab === 'quote' ? 'Crea tu primer presupuesto.' : 'Crea tu primera factura, o convierte un presupuesto aceptado.'}
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{tab === 'quote' ? 'Nuevo presupuesto' : 'Nueva factura'}</Button>}
          />
        ) : (
          <div className="surface-card overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Numero', 'Cliente', 'Emision', 'Total', 'Estado', ''].map(function(h) {
                  return <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                })}
              </tr></thead>
              <tbody>
                {visible.map(function(doc) {
                  var statusMap = doc.document_type === 'quote' ? QUOTE_STATUS : INVOICE_STATUS
                  var sc = statusMap[doc.status] || statusMap.draft
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <button type="button" onClick={function() { openPreview(doc) }} style={{ background: 'none', border: 'none', color: '#e63946', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}>
                          {doc.document_type === 'quote' ? doc.quote_number : doc.invoice_number}
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#e2e8f0' }}>{doc.clients ? (doc.clients.company || doc.clients.name) : '--'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>{fmtDate(doc.issue_date)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{fmtCur(doc.total)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <select value={doc.status} onChange={function(e) { handleStatusChange(doc.id, e.target.value) }}
                          style={{ background: sc.color + '18', border: '1px solid ' + sc.color + '44', color: sc.color, borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', cursor: 'pointer', outline: 'none' }}
                        >
                          {Object.entries(statusMap).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={function() { openEdit(doc) }} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: '#94a3b8' }}>✎</button>
                          <button type="button" onClick={function() { handleArchive(doc.id) }} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Archive style={{ width: '13px', height: '13px' }} /></button>
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{editing ? 'Editar documento' : (tab === 'quote' ? 'Nuevo presupuesto' : 'Nueva factura')}</h3>
            </div>
            <div className="modal-body">
              <DocumentEditor
                initial={editing}
                docType={editing ? editing.document_type : tab}
                clients={clients}
                defaultTaxRate={company.default_tax_rate || 21}
                defaultIrpfRate={company.default_irpf_rate || 15}
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