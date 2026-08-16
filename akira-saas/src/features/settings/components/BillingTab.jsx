import { useEffect, useState } from 'react'
import { AlertTriangle, Building2 } from 'lucide-react'
import { getCompanySettings, updateCompanySettings, uploadLogo } from '@db/queries/company.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function BillingTab() {
  var DEFAULTS = { company_name: '', tax_id: '', address: '', city: '', postal_code: '', country: 'EspaÃ±a', phone: '', email: '', logo_url: '', invoice_prefix: 'FAC', next_invoice_number: 1, default_tax_rate: 21, brand_color: '#e63946' }
  var [cs,      setCs]      = useState(DEFAULTS)
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)
  var [uploadingLogo, setUploadingLogo] = useState(false)
  var [error,   setError]   = useState('')

  var BRAND_PRESETS = ['#e63946', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#14b8a6', '#ec4899', '#64748b']

  useEffect(function() {
    getCompanySettings()
      .then(function(data) { setCs(Object.assign({}, DEFAULTS, data)) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setLoading(false) })
  }, [])

  function set(k) { return function(e) { setCs(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }
  function setColor(c) { setCs(function(f) { return Object.assign({}, f, { brand_color: c }) }) }

  function handleLogoChange(e) {
    var file = e.target.files && e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    setError('')
    uploadLogo(file)
      .then(function(url) { setCs(function(f) { return Object.assign({}, f, { logo_url: url }) }) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setUploadingLogo(false) })
  }

  function handleSave() {
    setSaving(true)
    setError('')
    updateCompanySettings({
      company_name:     cs.company_name,
      tax_id:           cs.tax_id,
      address:          cs.address,
      city:             cs.city,
      postal_code:      cs.postal_code,
      country:          cs.country,
      phone:            cs.phone,
      email:            cs.email,
      logo_url:         cs.logo_url,
      invoice_prefix:   cs.invoice_prefix,
      default_tax_rate: Number(cs.default_tax_rate) || 0,
      brand_color:      cs.brand_color, // â† NUEVO
    })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setSaving(false) })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Logo y color de marca" description="Como se ve tu identidad en el Portal de cliente">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {cs.logo_url ? (
              <img src={cs.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Building2 style={{ width: '28px', height: '28px', color: 'var(--text-5)' }} />
            )}
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
            {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
          </label>
        </div>

        {/* â”€â”€ NUEVO: selector de color de marca â”€â”€ */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color de marca</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {BRAND_PRESETS.map(function(c) {
              var active = cs.brand_color === c
              return (
                <button key={c} type="button" onClick={function() { setColor(c) }}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: active ? '2px solid #fff' : '2px solid transparent', boxShadow: active ? '0 0 0 2px ' + c : 'none', cursor: 'pointer' }}
                  title={c}
                />
              )
            })}
            <input type="color" value={cs.brand_color} onChange={function(e) { setColor(e.target.value) }}
              style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer', padding: 0, background: 'none' }}
              title="Elegir otro color"
            />
          </div>
        </div>

        {/* Preview del efecto */}
        <div style={{ padding: '14px', borderRadius: '10px', background: cs.brand_color + '0d', border: '1px solid ' + cs.brand_color + '30', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {cs.logo_url ? (
            <img src={cs.logo_url} alt="Logo" style={{ height: '24px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: cs.brand_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#fff' }}>
              {cs.company_name ? cs.company_name[0].toUpperCase() : 'A'}
            </div>
          )}
          <span style={{ fontSize: '12px', color: cs.brand_color, fontWeight: 600 }}>Asi se vera en el Portal de tu cliente</span>
        </div>
      </Section>

      <Section title="Datos fiscales" description="Apareceran en tus facturas">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Nombre / Razon social">
            <input value={cs.company_name || ''} onChange={set('company_name')} placeholder="Tu nombre o el de tu empresa" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="NIF / CIF">
            <input value={cs.tax_id || ''} onChange={set('tax_id')} placeholder="12345678A" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Direccion">
            <input value={cs.address || ''} onChange={set('address')} placeholder="Calle, nÃºmero" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Ciudad">
            <input value={cs.city || ''} onChange={set('city')} placeholder="Badalona" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Codigo postal">
            <input value={cs.postal_code || ''} onChange={set('postal_code')} placeholder="08911" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Pais">
            <input value={cs.country || ''} onChange={set('country')} placeholder="EspaÃ±a" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Telefono">
            <input value={cs.phone || ''} onChange={set('phone')} placeholder="+34 600 000 000" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Email de contacto">
            <input value={cs.email || ''} onChange={set('email')} placeholder="tu@email.com" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
      </Section>

      <Section title="NumeraciÃ³n y facturaciÃ³n" description="CÃ³mo se numeran tus facturas y el IVA por defecto">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Prefijo de factura" hint="Ej: FAC-2026-001">
            <input value={cs.invoice_prefix || ''} onChange={set('invoice_prefix')} placeholder="FAC" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="IVA por defecto (%)">
            <input type="number" min="0" step="0.1" value={cs.default_tax_rate} onChange={set('default_tax_rate')} style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Retencion IRPF por defecto (%)" hint="15% es lo habitual para autonomos que facturan a empresas">
            <input type="number" min="0" step="0.1" value={cs.default_irpf_rate} onChange={set('default_irpf_rate')} style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-4)' }}>
          La proxima factura que crees sera la numero{' '}
          <strong style={{ color: 'var(--text-1)' }}>
            {cs.invoice_prefix}-{String(cs.next_invoice_number).padStart(3, '0')}
          </strong>
        </p>
      </Section>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '13px', color: '#e63946', marginBottom: '16px' }}>
          <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

export default BillingTab

