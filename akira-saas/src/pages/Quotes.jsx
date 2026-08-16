import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, FileSignature, Archive, ChevronLeft, Building2, ArrowRightCircle, Wrench } from 'lucide-react'
import {
  getQuotes, getQuoteById, createQuote, updateQuote,
  updateQuoteStatus, archiveQuote, convertQuoteToInvoice, QUOTE_STATUS,
} from '@/services/quotes.service'
import { getCompanySettings } from '@/services/company.service'
import { getServicesForSelect } from '@/services/subscriptions.service'
import { downloadQuotePdf } from '@/shared/utils/generateQuotePdf'
import { supabase } from '@/shared/lib/supabase'
import { useAddRecent } from '@/shared/hooks/useAddRecent'
import { useCurrentItem } from '@/shared/context/CurrentItemContext'
import PageHeader   from '@/shared/components/layout/PageHeader'
import Button        from '@/shared/components/ui/Button'
import EmptyState   from '@/shared/components/ui/EmptyState'
import { PageSpinner } from '@/shared/components/ui/Spinner'
import { useSearchParams } from 'react-router-dom'

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'â‚¬' }
function fmtDate(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
function makeItemId() { return 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) }

var INP = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '8px 12px',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

function QuoteEditor({ initial, clients, defaultTaxRate, onSave, onCancel, loading }) {
  var today = new Date().toISOString().split('T')[0]

  var [clientId,    setClientId]    = useState(initial ? (initial.client_id || '') : '')
  var [issueDate,   setIssueDate]   = useState(initial ? initial.issue_date : today)
  var [validUntil,  setValidUntil]  = useState(initial ? (initial.valid_until || '') : '')
  var [taxRate,     setTaxRate]     = useState(initial ? initial.tax_rate : defaultTaxRate)
  var [notes,       setNotes]       = useState(initial ? (initial.notes || '') : '')
  var [items, setItems] = useState(function() {
    if (initial && Array.isArray(initial.items) && initial.items.length > 0) return initial.items
    return [{ id: makeItemId(), description: '', quantity: 1, price: 0 }]
  })

  // Servicios activos â€” NUEVO
  var [services, setServices] = useState([])
  useEffect(function() {
    getServicesForSelect().then(setServices).catch(function() { setServices([]) })
  }, [])

  function updateItem(id, field, value) {
    setItems(function(prev) { return prev.map(function(it) { return it.id === id ? Object.assign({}, it, { [field]: value }) : it }) })
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
    e.target.value = ''
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
    onSave({ client_id: clientId, issue_date: issueDate, valid_until: validUntil, tax_rate: taxRate, notes: notes, items: cleanItems })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label className="label-base">Cliente</label>
          <select value={clientId} onChange={function(e) { setClientId(e.target.value) }} style={INP}>
            <option value="">Sin cliente</option>
            {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}{c.company ? ' â€” ' + c.company : ''}</option> })}
          </select>
        </div>
        <div>
          <label className="label-base">Fecha de emision</label>
          <input type="date" value={issueDate} onChange={function(e) { setIssueDate(e.target.value) }} style={INP} />
        </div>
        <div>
          <label className="label-base">Valido hasta</label>
          <input type="date" value={validUntil} onChange={function(e) { setValidUntil(e.target.value) }} style={INP} />
        </div>
      </div>

      <div>
        <label className="label-base">Lineas del presupuesto</label>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px 36px', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Concepto</span><span>Cantidad</span><span>Precio</span><span>Total</span><span></span>
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
                <option value="">+ AÃ±adir servicio...</option>
                {services.map(function(s) {
                  return <option key={s.id} value={s.id}>{s.name} â€” {fmtCur(s.price)}</option>
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', alignItems: 'start' }}>
        <div>
          <label className="label-base">Notas (opcional)</label>
          <textarea value={notes} onChange={function(e) { setNotes(e.target.value) }} rows={3} placeholder="Condiciones, plazos de entrega..." style={Object.assign({}, INP, { resize: 'vertical' })} />
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
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear presupuesto'}</Button>
      </div>
    </form>
  )
}

function QuotePreview({ quote, company, onBack, onConvert, converting }) {
  var items = Array.isArray(quote.items) ? quote.items : []
  var client = quote.clients
  var [downloading, setDownloading] = useState(false)

  function handleDownload() {
    setDownloading(true)
    downloadQuotePdf(quote, company)
      .catch(function(e) { window.alert('Error al generar el PDF: ' + e.message) })
      .finally(function() { setDownloading(false) })
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <button type="button" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer' }}
        ><ChevronLeft style={{ width: '15px', height: '15px' }} /> Volver a presupuestos</button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {quote.status === 'accepted' && !quote.converted_invoice_id && (
            <button type="button" onClick={onConvert} disabled={converting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#22c55e', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: converting ? 'not-allowed' : 'pointer' }}
            ><ArrowRightCircle style={{ width: '15px', height: '15px' }} /> {converting ? 'Convirtiendo...' : 'Convertir en factura'}</button>
          )}
          <button type="button" onClick={handleDownload} disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer' }}
          >{downloading ? 'Generando...' : 'Descargar PDF'}</button>
        </div>
      </div>

      {quote.converted_invoice_id && (
        <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', color: '#22c55e' }}>
          Este presupuesto ya se convirtio en una factura. Buscala en la seccion Facturas.
        </div>
      )}

      <div style={{ background: '#ffffff', color: '#1a1a1a', borderRadius: '12px', padding: '48px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
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
            {company.email && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>{company.email}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>PRESUPUESTO</h1>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#e63946', margin: '4px 0' }}>{quote.quote_number}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>Emision: {fmtDate(quote.issue_date)}</p>
            {quote.valid_until && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>Valido hasta: {fmtDate(quote.valid_until)}</p>}
          </div>
        </div>

        <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#f8f8fb', borderRadius: '10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Para</p>
          <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{client ? (client.company || client.name) : 'Sin cliente'}</p>
        </div>

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>Subtotal</span><span>{fmtCur(quote.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ color: '#666' }}>IVA ({quote.tax_rate}%)</span><span>{fmtCur(quote.tax_amount)}</span>
            </div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900 }}>
              <span>Total</span><span>{fmtCur(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>Notas</p>
            <p style={{ fontSize: '12px', color: '#666', whiteSpace: 'pre-wrap' }}>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Quotes() {
  var { addRecent } = useAddRecent()
  var { setCurrentItem } = useCurrentItem()

  var [quotes,     setQuotes]     = useState([])
  var [company,    setCompany]    = useState(null)
  var [clients,    setClients]    = useState([])
  var [loading,    setLoading]    = useState(true)
  var [modalOpen,  setModalOpen]  = useState(false)
  var [editing,    setEditing]    = useState(null)
  var [formLoading, setFormLoading] = useState(false)
  var [previewing, setPreviewing] = useState(null)
  var [converting, setConverting] = useState(false)
  var [toastMsg,   setToastMsg]   = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  var loadAll = useCallback(function() {
    setLoading(true)
    Promise.all([
      getQuotes(),
      getCompanySettings(),
      supabase.from('clients').select('id, name, company').eq('archived', false).order('name'),
    ]).then(function(results) {
      setQuotes(results[0])
      setCompany(results[1])
      setClients((results[2].data) || [])
    }).catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { loadAll() }, [loadAll])

  // Abrir directamente un presupuesto si venimos de la busqueda global â€” NUEVO
  var [searchParams] = useSearchParams()
  useEffect(function() {
    var openId = searchParams.get('open')
    if (openId) {
      getQuoteById(openId).then(setPreviewing).catch(function() {})
    }
  }, [searchParams])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(q) { setEditing(q); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSave(form) {
    setFormLoading(true)
    var promise = editing ? updateQuote(editing.id, form) : createQuote(form)
    promise
      .then(function(saved) {
        if (editing) {
          setQuotes(function(prev) { return prev.map(function(q) { return q.id === saved.id ? saved : q }) })
          showToast('Presupuesto actualizado')
        } else {
          setQuotes(function(prev) { return [saved].concat(prev) })
          showToast('Presupuesto ' + saved.quote_number + ' creado')
          getCompanySettings().then(setCompany).catch(function() {})
        }
        closeModal()
      })
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setFormLoading(false) })
  }

  function handleStatusChange(id, status) {
    updateQuoteStatus(id, status)
      .then(function(updated) {
        setQuotes(function(prev) { return prev.map(function(q) { return q.id === updated.id ? updated : q }) })
        if (previewing && previewing.id === id) setPreviewing(updated)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleArchive(id) {
    if (!window.confirm('Archivar este presupuesto?')) return
    archiveQuote(id)
      .then(function() {
        setQuotes(function(prev) { return prev.filter(function(q) { return q.id !== id }) })
        showToast('Presupuesto archivado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function openPreview(q) {
    getQuoteById(q.id).then(function(data) {
      setPreviewing(data)
      addRecent('quote', q.id)
      setCurrentItem({ type: 'quote', id: q.id, name: q.quote_number || 'Presupuesto ' + q.id })
    }).catch(function(e) { showToast(e.message, 'error') })
  }

  function handleConvert() {
    if (!previewing) return
    setConverting(true)
    convertQuoteToInvoice(previewing.id)
      .then(function() {
        showToast('Convertido en factura correctamente')
        return getQuoteById(previewing.id)
      })
      .then(setPreviewing)
      .catch(function(e) { showToast(e.message, 'error') })
      .finally(function() { setConverting(false) })
  }

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}><PageSpinner label="Cargando presupuestos..." /></div>
  }

  if (previewing) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <QuotePreview quote={previewing} company={company} onBack={function() { setPreviewing(null) }} onConvert={handleConvert} converting={converting} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Presupuestos"
        description={quotes.length + ' presupuesto' + (quotes.length !== 1 ? 's' : '')}
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nuevo presupuesto</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {!company || !company.company_name ? (
          <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#f59e0b' }}>
            Todavia no has rellenado tus datos fiscales. Ve a Configuracion â†’ Facturacion antes de crear tu primer presupuesto.
          </div>
        ) : null}

        {quotes.length === 0 ? (
          <EmptyState
            icon={FileSignature}
            title="Sin presupuestos todavia"
            description="Crea tu primer presupuesto para empezar a proponer trabajos a tus clientes."
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Nuevo presupuesto</Button>}
          />
        ) : (
          <div className="surface-card overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Numero', 'Cliente', 'Emision', 'Total', 'Estado', ''].map(function(h) {
                    return <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {quotes.map(function(q) {
                  var sc = QUOTE_STATUS[q.status] || QUOTE_STATUS.draft
                  return (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <button type="button" onClick={function() { openPreview(q) }}
                          style={{ background: 'none', border: 'none', color: '#e63946', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
                        >{q.quote_number}</button>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#e2e8f0' }}>
                        {q.clients ? (q.clients.company || q.clients.name) : '--'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>{fmtDate(q.issue_date)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{fmtCur(q.total)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <select value={q.status} onChange={function(e) { handleStatusChange(q.id, e.target.value) }}
                          style={{ background: sc.color + '18', border: '1px solid ' + sc.color + '44', color: sc.color, borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', cursor: 'pointer', outline: 'none' }}
                        >
                          {Object.entries(QUOTE_STATUS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={function() { openEdit(q) }}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: '#94a3b8' }}
                          >âœŽ</button>
                          <button type="button" onClick={function() { handleArchive(q.id) }}
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{editing ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h3>
            </div>
            <div className="modal-body">
              <QuoteEditor
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


