import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Building2, Lock, Database,
  Save, AlertTriangle, Check,
  Eye, EyeOff, ChevronRight, ChevronLeft,
  Users2, Trash2, Mail, Receipt, History,
  Tag, Bell, AlertOctagon, Download, FileText, Plug, Workflow,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  getProfile, updateProfile,
  getWorkspace, updateWorkspace,
  updatePassword, getAccountStats,
} from '@/services/settings.service'
import {
  getInvitations, createInvitation, cancelInvitation,
  removeMember, updateMemberRole, sendInvitationEmail,
} from '@/services/org.service'
import {
  getCompanySettings, updateCompanySettings, uploadLogo,
} from '@/services/company.service'
import { getAuditLog, RESOURCE_LABELS, ACTION_LABELS } from '@/services/audit.service'
import {
  getFinanceCategories, createFinanceCategory, renameFinanceCategory, archiveFinanceCategory,
} from '@/services/categories.service'
import { downloadExport, downloadCsv } from '@/services/export.service'
import {
  getProjectTemplates, createProjectTemplate, updateProjectTemplate, archiveProjectTemplate,
  getEmailTemplates, createEmailTemplate, updateEmailTemplate, archiveEmailTemplate,
} from '@/services/templates.service'
import { useAuth } from '@/context/AuthContext'
import { useOrg }  from '@/context/OrgContext'
import PageHeader  from '@/components/layout/PageHeader'
import ResourceAccessModal from '@/components/settings/ResourceAccessModal'
import { getQuarterlyReport } from '@/services/quarterlyReport.service'
import { downloadQuarterlyReportPdf } from '@/utils/generateQuarterlyReportPdf'

/* ══════════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════ */
var INP = {
  background:  'var(--bg-3)',
  border:      '1px solid var(--border)',
  color:       'var(--text-1)',
  borderRadius: '8px',
  fontSize:    '13px',
  padding:     '9px 12px',
  outline:     'none',
  fontFamily:  'inherit',
  width:       '100%',
  boxSizing:   'border-box',
  transition:  'border-color 0.15s',
}

function onFocus(e)  { e.target.style.borderColor = 'var(--brand)' }
function onBlur(e)   { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>
        {description && <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '4px' }}>{description}</p>}
      </div>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function SaveBtn({ loading, saved, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: saved ? '#22c55e' : 'var(--gradient-brand)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
    >
      {saved
        ? <><Check style={{ width: '14px', height: '14px' }} /> Guardado</>
        : loading ? 'Guardando...'
        : <><Save style={{ width: '14px', height: '14px' }} /> Guardar</>
      }
    </button>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, background: toast.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(34,197,94,0.1)', color: toast.type === 'error' ? '#e63946' : '#22c55e', border: '1px solid ' + (toast.type === 'error' ? 'rgba(230,57,70,0.25)' : 'rgba(34,197,94,0.25)') }}>
      {toast.msg}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: PERFIL
══════════════════════════════════════════════════════════ */
function ProfileTab({ user }) {
  var [profile, setProfile] = useState({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getProfile()
      .then(function(data) { setProfile(Object.assign({ full_name: '', phone: '', website: '', bio: '', location: '', company: '', role: '' }, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function set(k) { return function(e) { setProfile(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  function handleSave() {
    setSaving(true)
    updateProfile(profile)
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Informacion personal" description="Tu nombre e informacion de contacto visible en AKIRA">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Nombre completo">
            <input value={profile.full_name || ''} onChange={set('full_name')} placeholder="Tu nombre" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Empresa">
            <input value={profile.company || ''} onChange={set('company')} placeholder="Nombre de tu empresa" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Rol / Cargo">
            <input value={profile.role || ''} onChange={set('role')} placeholder="Ej: Director Creativo" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Telefono">
            <input value={profile.phone || ''} onChange={set('phone')} placeholder="+34 600 000 000" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Sitio web">
            <input value={profile.website || ''} onChange={set('website')} placeholder="https://tuwebsite.com" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Ubicacion">
            <input value={profile.location || ''} onChange={set('location')} placeholder="Madrid, España" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        <Field label="Bio" hint="Una descripcion breve sobre ti o tu negocio">
          <textarea value={profile.bio || ''} onChange={set('bio')} placeholder="Cuentanos sobre ti..." rows={3} style={Object.assign({}, INP, { resize: 'vertical' })} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </Section>

      <Section title="Cuenta" description="Tu email de acceso a AKIRA">
        <Field label="Email" hint="El email no se puede cambiar desde aqui">
          <input value={user ? user.email : ''} disabled style={Object.assign({}, INP, { opacity: 0.5, cursor: 'not-allowed' })} />
        </Field>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: WORKSPACE
══════════════════════════════════════════════════════════ */
function WorkspaceTab() {
  var [ws,      setWs]      = useState({ business_name: '', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getWorkspace()
      .then(function(data) { setWs(Object.assign({ business_name: '', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es' }, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function set(k) { return function(e) { setWs(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  function handleSave() {
    setSaving(true)
    updateWorkspace({ business_name: ws.business_name, currency: ws.currency, timezone: ws.timezone, language: ws.language })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  return (
    <div>
      <Section title="Negocio" description="Informacion general de tu empresa">
        <Field label="Nombre del negocio">
          <input value={ws.business_name || ''} onChange={set('business_name')} placeholder="Tu empresa S.L." style={INP} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </Section>

      <Section title="Preferencias regionales" description="Moneda, zona horaria e idioma">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <Field label="Moneda">
            <select value={ws.currency || 'EUR'} onChange={set('currency')} style={SEL}>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dolar</option>
              <option value="GBP">GBP — Libra</option>
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="COP">COP — Peso colombiano</option>
              <option value="ARS">ARS — Peso argentino</option>
            </select>
          </Field>
          <Field label="Zona horaria">
            <select value={ws.timezone || 'Europe/Madrid'} onChange={set('timezone')} style={SEL}>
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/Mexico_City">America/Mexico City</option>
              <option value="America/Bogota">America/Bogota</option>
              <option value="America/Buenos_Aires">America/Buenos Aires</option>
              <option value="America/New_York">America/New York</option>
              <option value="America/Los_Angeles">America/Los Angeles</option>
            </select>
          </Field>
          <Field label="Idioma">
            <select value={ws.language || 'es'} onChange={set('language')} style={SEL}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: FACTURACION
══════════════════════════════════════════════════════════ */
function BillingTab() {
  var DEFAULTS = { company_name: '', tax_id: '', address: '', city: '', postal_code: '', country: 'España', phone: '', email: '', logo_url: '', invoice_prefix: 'FAC', next_invoice_number: 1, default_tax_rate: 21, brand_color: '#e63946' }
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
      brand_color:      cs.brand_color, // ← NUEVO
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

        {/* ── NUEVO: selector de color de marca ── */}
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
            <input value={cs.address || ''} onChange={set('address')} placeholder="Calle, número" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Ciudad">
            <input value={cs.city || ''} onChange={set('city')} placeholder="Badalona" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Codigo postal">
            <input value={cs.postal_code || ''} onChange={set('postal_code')} placeholder="08911" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Pais">
            <input value={cs.country || ''} onChange={set('country')} placeholder="España" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Telefono">
            <input value={cs.phone || ''} onChange={set('phone')} placeholder="+34 600 000 000" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="Email de contacto">
            <input value={cs.email || ''} onChange={set('email')} placeholder="tu@email.com" style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
      </Section>

      <Section title="Numeración y facturación" description="Cómo se numeran tus facturas y el IVA por defecto">
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
/* ══════════════════════════════════════════════════════════
   TAB: CATEGORIAS
══════════════════════════════════════════════════════════ */
function CategoriesTab() {
  var [categories, setCategories] = useState([])
  var [loading,     setLoading]   = useState(true)
  var [newName,     setNewName]   = useState('')
  var [adding,      setAdding]    = useState(false)
  var [renamingId,  setRenamingId] = useState(null)
  var [renameVal,   setRenameVal]  = useState('')
  var [toast,       setToast]      = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  function load() {
    setLoading(true)
    getFinanceCategories()
      .then(function(data) { setCategories(data) })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [])

  function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    createFinanceCategory(newName.trim())
      .then(function(cat) {
        setCategories(function(prev) { return prev.concat([cat]) })
        setNewName('')
        showMsg('Categoria anadida')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setAdding(false) })
  }

  function handleRename(id) {
    if (!renameVal.trim()) { setRenamingId(null); return }
    renameFinanceCategory(id, renameVal.trim())
      .then(function(updated) {
        setCategories(function(prev) { return prev.map(function(c) { return c.id === id ? updated : c }) })
        setRenamingId(null)
        showMsg('Categoria actualizada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleArchive(id) {
    if (!window.confirm('Eliminar esta categoria? Los movimientos que ya la usan la conservaran en su historial.')) return
    archiveFinanceCategory(id)
      .then(function() {
        setCategories(function(prev) { return prev.filter(function(c) { return c.id !== id }) })
        showMsg('Categoria eliminada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Categorias de Finanzas" description="Las que veras al elegir la categoria de un movimiento">
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={newName}
            onChange={function(e) { setNewName(e.target.value) }}
            placeholder="Nombre de la nueva categoría"
            style={INP}
            onKeyDown={function(e) { if (e.key === 'Enter') handleAdd() }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <button type="button" onClick={handleAdd} disabled={adding || !newName.trim()}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer', opacity: adding || !newName.trim() ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
          >Anadir</button>
        </div>
      </Section>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map(function(cat) {
            var isRenaming = renamingId === cat.id
            return (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                {isRenaming ? (
                  <input
                    value={renameVal}
                    onChange={function(e) { setRenameVal(e.target.value) }}
                    onBlur={function() { handleRename(cat.id) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setRenamingId(null) }}
                    autoFocus
                    style={Object.assign({}, INP, { flex: 1 })}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-1)' }}>{cat.name}</span>
                )}
                {!isRenaming && (
                  <>
                    <button type="button" onClick={function() { setRenameVal(cat.name); setRenamingId(cat.id) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', borderRadius: '6px', fontSize: '13px' }}
                    >✎</button>
                    <button type="button" onClick={function() { handleArchive(cat.id) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px' }}
                    ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: NOTIFICACIONES
══════════════════════════════════════════════════════════ */
function NotificationsTab() {
  var DEFAULTS = { notify_overdue_invoices: true, notify_stale_clients: true, notify_urgent_tasks: true, stale_client_days: 7 }
  var [cfg,     setCfg]     = useState(DEFAULTS)
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getCompanySettings()
      .then(function(data) { setCfg(Object.assign({}, DEFAULTS, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function toggle(key) {
    return function() { setCfg(function(f) { return Object.assign({}, f, { [key]: !f[key] }) }) }
  }

  function handleSave() {
    setSaving(true)
    updateCompanySettings({
      notify_overdue_invoices: cfg.notify_overdue_invoices,
      notify_stale_clients:    cfg.notify_stale_clients,
      notify_urgent_tasks:     cfg.notify_urgent_tasks,
      stale_client_days:       Number(cfg.stale_client_days) || 7,
    })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  function Toggle({ checked, onClick }) {
    return (
      <button type="button" onClick={onClick}
        style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', border: 'none', background: checked ? 'var(--brand)' : '#374151', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    )
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Que quieres que te avise la campana" description="Activa o desactiva cada tipo de aviso">
        {[
          ['notify_overdue_invoices', 'Facturas vencidas', 'Cuando una factura pasa su fecha de vencimiento sin cobrar'],
          ['notify_stale_clients',    'Clientes sin contactar', 'Cuando un cliente activo lleva demasiado tiempo sin actividad'],
          ['notify_urgent_tasks',     'Tareas urgentes', 'Tareas marcadas como urgentes en tus proyectos'],
        ].map(function(row) {
          return (
            <div key={row[0]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{row[1]}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{row[2]}</p>
              </div>
              <Toggle checked={cfg[row[0]]} onClick={toggle(row[0])} />
            </div>
          )
        })}
      </Section>

      {cfg.notify_stale_clients && (
        <Section title="Sensibilidad del aviso" description="A partir de cuantos dias sin actividad se considera un cliente frio">
          <Field label="Dias sin contacto">
            <input type="number" min="1" value={cfg.stale_client_days} onChange={function(e) { setCfg(function(f) { return Object.assign({}, f, { stale_client_days: e.target.value }) }) }} style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </Section>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: DATOS (exportar / copia de seguridad)
══════════════════════════════════════════════════════════ */
function QuarterlyReportPicker() {
  var now = new Date()
  var currentQuarter = Math.floor(now.getMonth() / 3) + 1
  var [year, setYear] = useState(now.getFullYear())
  var [quarter, setQuarter] = useState(currentQuarter)
  var [generating, setGenerating] = useState(false)

  function handleGenerate() {
    setGenerating(true)
    Promise.all([getQuarterlyReport(year, quarter), getCompanySettings()])
      .then(function(results) {
        downloadQuarterlyReportPdf(results[0], results[1])
      })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setGenerating(false) })
  }

  var years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <select value={quarter} onChange={function(e) { setQuarter(Number(e.target.value)) }} style={INP}>
        <option value={1}>T1 (Ene-Mar)</option>
        <option value={2}>T2 (Abr-Jun)</option>
        <option value={3}>T3 (Jul-Sep)</option>
        <option value={4}>T4 (Oct-Dic)</option>
      </select>
      <select value={year} onChange={function(e) { setYear(Number(e.target.value)) }} style={INP}>
        {years.map(function(y) { return <option key={y} value={y}>{y}</option> })}
      </select>
      <button type="button" onClick={handleGenerate} disabled={generating}
        style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1, whiteSpace: 'nowrap' }}
      >{generating ? 'Generando...' : 'Descargar informe (PDF)'}</button>
    </div>
  )
}

function DataExportTab() {
  var [downloading,   setDownloading]   = useState(false)
  var [downloadingCsv, setDownloadingCsv] = useState(null)
  var [toast,         setToast]         = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  function handleFullExport() {
    setDownloading(true)
    downloadExport()
      .then(function() { showMsg('Copia de seguridad descargada') })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setDownloading(false) })
  }

  function handleCsvExport(table, label) {
    setDownloadingCsv(table)
    downloadCsv(table, table)
      .then(function() { showMsg(label + ' exportado') })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setDownloadingCsv(null) })
  }

  var CSV_TABLES = [
    ['clients', 'Clientes'],
    ['projects', 'Proyectos'],
    ['invoices', 'Facturas'],
    ['finance_entries', 'Finanzas'],
  ]

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Copia de seguridad completa" description="Descarga todos tus datos en un unico archivo, por si algun dia quieres migrar o simplemente tener tu propia copia">
        <button type="button" onClick={handleFullExport} disabled={downloading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1, alignSelf: 'flex-start' }}
        >{downloading ? 'Generando...' : 'Descargar copia completa (.json)'}</button>
        <p style={{ fontSize: '11px', color: 'var(--text-5)' }}>
          Incluye clientes, proyectos, facturas, finanzas, suscripciones, servicios, calendario y documentos de conocimiento.
        </p>
      </Section>

      <Section title="Exportar por partes (Excel / Google Sheets)" description="Cada tabla en su propio archivo, mas facil de abrir y filtrar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CSV_TABLES.map(function(t) {
            var isLoading = downloadingCsv === t[0]
            return (
              <div key={t[0]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{t[1]}</span>
                <button type="button" onClick={function() { handleCsvExport(t[0], t[1]) }} disabled={isLoading}
                  style={{ padding: '6px 14px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >{isLoading ? 'Descargando...' : 'Descargar CSV'}</button>
              </div>
            )
          })}
        </div>
        <Section title="Informe trimestral para tu gestor" description="Base imponible, IVA repercutido, retencion IRPF y gastos, todo listo para presentar">
        <QuarterlyReportPicker />
      </Section>
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: PLANTILLAS
══════════════════════════════════════════════════════════ */
function ProjectTemplateForm({ initial, onSave, onCancel }) {
  var [form, setForm] = useState({
    name:             initial ? initial.name : '',
    default_priority: initial ? initial.default_priority : 'medium',
    default_stage:    initial ? initial.default_stage    : 'preproduction',
    default_budget:   initial ? String(initial.default_budget || 0) : '',
    default_notes:    initial ? (initial.default_notes || '') : '',
  })
  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--brand-border)', borderRadius: '10px' }}>
      <input value={form.name} onChange={set('name')} placeholder="Nombre de la plantilla (ej: Reel para cliente)" style={INP} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <select value={form.default_priority} onChange={set('default_priority')} style={Object.assign({}, INP, { cursor: 'pointer' })}>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <select value={form.default_stage} onChange={set('default_stage')} style={Object.assign({}, INP, { cursor: 'pointer' })}>
          <option value="preproduction">Preproduccion</option>
          <option value="production">Produccion</option>
          <option value="postproduction">Postproduccion</option>
          <option value="delivery">Entrega</option>
          <option value="closed">Cerrado</option>
        </select>
        <input type="number" min="0" value={form.default_budget} onChange={set('default_budget')} placeholder="Presupuesto" style={INP} />
      </div>
      <textarea value={form.default_notes} onChange={set('default_notes')} rows={2} placeholder="Notas por defecto..." style={Object.assign({}, INP, { resize: 'vertical' })} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        <button type="button" onClick={function() { onSave(form) }} disabled={!form.name.trim()} style={{ flex: 2, padding: '8px', borderRadius: '7px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: form.name.trim() ? 'pointer' : 'not-allowed', opacity: form.name.trim() ? 1 : 0.5 }}>Guardar</button>
      </div>
    </div>
  )
}

function EmailTemplateForm({ initial, onSave, onCancel }) {
  var [form, setForm] = useState({
    name:    initial ? initial.name : '',
    subject: initial ? initial.subject : '',
    body:    initial ? initial.body : '',
  })
  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--brand-border)', borderRadius: '10px' }}>
      <input value={form.name} onChange={set('name')} placeholder="Nombre de la plantilla (ej: Seguimiento)" style={INP} />
      <input value={form.subject} onChange={set('subject')} placeholder="Asunto del email" style={INP} />
      <textarea value={form.body} onChange={set('body')} rows={5} placeholder={'Cuerpo del email. Usa {{nombre}} y {{empresa}} para que se rellenen solos.'} style={Object.assign({}, INP, { resize: 'vertical' })} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', borderRadius: '7px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        <button type="button" onClick={function() { onSave(form) }} disabled={!form.name.trim() || !form.subject.trim() || !form.body.trim()} style={{ flex: 2, padding: '8px', borderRadius: '7px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
      </div>
    </div>
  )
}

function TemplatesTab() {
  var [projectTemplates, setProjectTemplates] = useState([])
  var [emailTemplates,   setEmailTemplates]   = useState([])
  var [loading,          setLoading]          = useState(true)
  var [showProjectForm,  setShowProjectForm]  = useState(false)
  var [showEmailForm,    setShowEmailForm]    = useState(false)
  var [editingProject,   setEditingProject]   = useState(null)
  var [editingEmail,     setEditingEmail]     = useState(null)
  var [toast,            setToast]            = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  function load() {
    setLoading(true)
    Promise.all([getProjectTemplates(), getEmailTemplates()])
      .then(function(results) { setProjectTemplates(results[0]); setEmailTemplates(results[1]) })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [])

  function handleSaveProject(form) {
    var promise = editingProject ? updateProjectTemplate(editingProject.id, form) : createProjectTemplate(form)
    promise.then(function(saved) {
      if (editingProject) setProjectTemplates(function(prev) { return prev.map(function(t) { return t.id === saved.id ? saved : t }) })
      else setProjectTemplates(function(prev) { return prev.concat([saved]) })
      setShowProjectForm(false); setEditingProject(null)
      showMsg('Plantilla guardada')
    }).catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleSaveEmail(form) {
    var promise = editingEmail ? updateEmailTemplate(editingEmail.id, form) : createEmailTemplate(form)
    promise.then(function(saved) {
      if (editingEmail) setEmailTemplates(function(prev) { return prev.map(function(t) { return t.id === saved.id ? saved : t }) })
      else setEmailTemplates(function(prev) { return prev.concat([saved]) })
      setShowEmailForm(false); setEditingEmail(null)
      showMsg('Plantilla guardada')
    }).catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleArchiveProject(id) {
    if (!window.confirm('Eliminar esta plantilla?')) return
    archiveProjectTemplate(id).then(function() {
      setProjectTemplates(function(prev) { return prev.filter(function(t) { return t.id !== id }) })
    }).catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleArchiveEmail(id) {
    if (!window.confirm('Eliminar esta plantilla?')) return
    archiveEmailTemplate(id).then(function() {
      setEmailTemplates(function(prev) { return prev.filter(function(t) { return t.id !== id }) })
    }).catch(function(e) { showMsg(e.message, 'error') })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Plantillas de proyecto" description="Aparecen como opcion al crear un proyecto nuevo, para no rellenar lo mismo cada vez">
        {projectTemplates.map(function(t) {
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{t.default_priority} · {t.default_stage} · {t.default_budget}€</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={function() { setEditingProject(t); setShowProjectForm(true) }} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: '13px' }}>✎</button>
                <button type="button" onClick={function() { handleArchiveProject(t.id) }} style={{ background: 'none', border: 'none', color: 'rgba(230,57,70,0.5)', cursor: 'pointer' }}><Trash2 style={{ width: '13px', height: '13px' }} /></button>
              </div>
            </div>
          )
        })}

        {showProjectForm ? (
          <ProjectTemplateForm initial={editingProject} onSave={handleSaveProject} onCancel={function() { setShowProjectForm(false); setEditingProject(null) }} />
        ) : (
          <button type="button" onClick={function() { setShowProjectForm(true) }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >+ Nueva plantilla de proyecto</button>
        )}
      </Section>

      <Section title="Plantillas de email" description="Textos reutilizables para escribir a tus clientes, con {{nombre}} y {{empresa}} que se rellenan solos">
        {emailTemplates.map(function(t) {
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button type="button" onClick={function() { setEditingEmail(t); setShowEmailForm(true) }} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: '13px' }}>✎</button>
                <button type="button" onClick={function() { handleArchiveEmail(t.id) }} style={{ background: 'none', border: 'none', color: 'rgba(230,57,70,0.5)', cursor: 'pointer' }}><Trash2 style={{ width: '13px', height: '13px' }} /></button>
              </div>
            </div>
          )
        })}

        {showEmailForm ? (
          <EmailTemplateForm initial={editingEmail} onSave={handleSaveEmail} onCancel={function() { setShowEmailForm(false); setEditingEmail(null) }} />
        ) : (
          <button type="button" onClick={function() { setShowEmailForm(true) }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >+ Nueva plantilla de email</button>
        )}
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: INTEGRACIONES (nueva)
══════════════════════════════════════════════════════════ */
function IntegrationCard({ name, description, status, icon }) {
  var CFG = {
    connected:    { label: 'Conectado',     color: '#22c55e' },
    not_connected: { label: 'No configurado', color: '#f59e0b' },
    coming_soon:  { label: 'Proximamente',  color: '#64748b' },
  }
  var s = CFG[status] || CFG.coming_soon

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{name}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{description}</p>
      </div>
      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: s.color + '20', color: s.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {s.label}
      </span>
    </div>
  )
}

function IntegrationsTab() {
  var geminiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY

  return (
    <div>
      <Section title="Inteligencia artificial" description="El motor que hace funcionar a Akira Brain">
        <IntegrationCard
          name="Google Gemini"
          description={geminiConfigured ? 'Clave configurada. Si Akira Brain no responde, puede ser un tema de cuota de tu cuenta de Google, no de la conexion en si.' : 'Falta la clave VITE_GEMINI_API_KEY en tu archivo .env'}
          status={geminiConfigured ? 'connected' : 'not_connected'}
          icon="✨"
        />
      </Section>

      <Section title="Correo" description="Como se envian los recordatorios y las plantillas de email">
        <IntegrationCard
          name="Cliente de correo del dispositivo"
          description="Los recordatorios y plantillas abren tu app de correo (Gmail, Mail...) ya redactados, para que revises y envies tu mismo. No se manda nada de forma automatica."
          status="connected"
          icon="✉️"
        />
      </Section>

      <Section title="Cobros" description="Para cobrar directamente desde una factura">
        <IntegrationCard
          name="Stripe"
          description="Añadir un boton de pago directo en tus facturas. Todavia no esta conectado."
          status="coming_soon"
          icon="💳"
        />
      </Section>

      <Section title="Base de datos" description="Donde vive toda la informacion de tu negocio">
        <IntegrationCard
          name="Supabase"
          description="Base de datos, autenticacion, archivos y tiempo real. Es el corazon de AKIRA."
          status="connected"
          icon="🗄️"
        />
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: AUDITORIA
══════════════════════════════════════════════════════════ */
function AuditTab() {
  var [logs,     setLogs]     = useState([])
  var [loading,  setLoading]  = useState(true)
  var [resource, setResource] = useState('all')
  var [action,   setAction]   = useState('all')
  var [expanded, setExpanded] = useState(null)
  var [error,    setError]    = useState('')

  function load() {
    setLoading(true)
    setError('')
    getAuditLog({ resource: resource, action: action })
      .then(function(data) { setLogs(data) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [resource, action])

  function fmtDateTime(d) {
    return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  return (
    <div>
      <Section title="Registro de actividad" description="Quien hizo que y cuando, en tu cuenta">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' }}>
          <select value={resource} onChange={function(e) { setResource(e.target.value) }} style={SEL}>
            <option value="all">Todos los tipos</option>
            {Object.entries(RESOURCE_LABELS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1]}</option> })}
          </select>
          <select value={action} onChange={function(e) { setAction(e.target.value) }} style={SEL}>
            <option value="all">Todas las acciones</option>
            {Object.entries(ACTION_LABELS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
          </select>
        </div>
      </Section>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '13px', color: '#e63946', marginBottom: '16px' }}>
          <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
          Sin actividad registrada todavia con estos filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map(function(row) {
            var ac = ACTION_LABELS[row.action] || { label: row.action, color: '#94a3b8' }
            var resourceLabel = RESOURCE_LABELS[row.resource] || row.resource
            var isExpanded = expanded === row.id
            var userName = row.userName || 'Tu'

            return (
              <div key={row.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <button type="button"
                  onClick={function() { setExpanded(isExpanded ? null : row.id) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                      <strong>{userName}</strong>
                      {' '}
                      <span style={{ color: ac.color, fontWeight: 600 }}>{ac.label.toLowerCase()}</span>
                      {' '}
                      {resourceLabel.toLowerCase()}
                      {row.displayName && <span style={{ color: 'var(--text-3)' }}>: {row.displayName}</span>}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '2px' }}>{fmtDateTime(row.created_at)}</p>
                  </div>
                </button>

                {isExpanded && row.changes && row.changes.length > 0 && (
                  <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {row.changes.map(function(c, i) {
                      return (
                        <div key={i} style={{ fontSize: '11px', color: 'var(--text-4)', padding: '6px 10px', background: 'var(--bg-4)', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--text-2)' }}>{c.field}</strong>: {String(c.from)} → {String(c.to)}
                        </div>
                      )
                    })}
                  </div>
                )}

                {isExpanded && (!row.changes || row.changes.length === 0) && row.action !== 'updated' && (
                  <div style={{ padding: '0 14px 12px', fontSize: '11px', color: 'var(--text-5)' }}>
                    Sin detalles adicionales para este tipo de accion.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: AUTOMATIZACIONES
══════════════════════════════════════════════════════════ */
function AutomationsTab() {
  var DEFAULTS = { auto_finance_on_paid: true, auto_followup_new_client: true, auto_review_on_completed: true }
  var [cfg,     setCfg]     = useState(DEFAULTS)
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getCompanySettings()
      .then(function(data) { setCfg(Object.assign({}, DEFAULTS, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function toggle(key) {
    return function() { setCfg(function(f) { return Object.assign({}, f, { [key]: !f[key] }) }) }
  }

  function handleSave() {
    setSaving(true)
    updateCompanySettings({
      auto_finance_on_paid:     cfg.auto_finance_on_paid,
      auto_followup_new_client: cfg.auto_followup_new_client,
      auto_review_on_completed: cfg.auto_review_on_completed,
    })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  function Toggle({ checked, onClick }) {
    return (
      <button type="button" onClick={onClick}
        style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', border: 'none', background: checked ? 'var(--brand)' : '#374151', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    )
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Automatizaciones activas" description="La base de datos las ejecuta sola, sin que necesites tener la app abierta">
        {[
          ['auto_finance_on_paid', 'Factura pagada → ingreso en Finanzas', 'Al marcar una factura como pagada, se registra automaticamente el ingreso'],
          ['auto_followup_new_client', 'Cliente nuevo → seguimiento a 7 dias', 'Se crea un evento de calendario recordandote contactarlo'],
          ['auto_review_on_completed', 'Proyecto completado → pedir reseña a 3 dias', 'Se crea un evento de calendario para pedirle feedback al cliente'],
        ].map(function(row) {
          return (
            <div key={row[0]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{row[1]}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{row[2]}</p>
              </div>
              <Toggle checked={cfg[row[0]]} onClick={toggle(row[0])} />
            </div>
          )
        })}
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: EQUIPO
══════════════════════════════════════════════════════════ */
function TeamTab() {
  var { org, members, myRole, refreshOrg } = useOrg()
  var [managingAccess, setManagingAccess] = useState(null) // ← NUEVO
  var [invitations, setInvitations] = useState([])
  var [loading,     setLoading]     = useState(true)
  var [email,       setEmail]       = useState('')
  var [role,        setRole]        = useState('member')
  var [inviting,    setInviting]    = useState(false)
  var [toast,       setToast]       = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    if (!org) return
    setLoading(true)
    getInvitations(org.id)
      .then(function(data) { setInvitations(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [org])

  function handleInvite() {
    if (!email.trim() || !org) return
    setInviting(true)
    createInvitation(org.id, email.trim(), role)
      .then(function(inv) {
        var inviteUrl = window.location.origin + '/join?token=' + inv.token
        return sendInvitationEmail(email.trim(), org.name, inviteUrl)
          .then(function() {
            setInvitations(function(prev) { return [inv].concat(prev) })
            setEmail('')
            showMsg('Invitacion enviada a ' + email)
          })
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setInviting(false) })
  }

  function handleRemove(memberId, memberName) {
    if (!window.confirm('Eliminar a ' + memberName + ' del equipo?')) return
    removeMember(memberId)
      .then(function() { refreshOrg(); showMsg('Miembro eliminado') })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleRoleChange(memberId, newRole) {
    updateMemberRole(memberId, newRole)
      .then(function() { refreshOrg(); showMsg('Rol actualizado') })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleCancelInvite(id) {
    cancelInvitation(id)
      .then(function() {
        setInvitations(function(prev) { return prev.filter(function(i) { return i.id !== id }) })
        showMsg('Invitacion cancelada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  var ROLE_LABELS = { owner: 'Propietario', admin: 'Admin', member: 'Miembro', viewer: 'Lector' }
  var ROLE_COLORS = { owner: '#e63946', admin: '#a855f7', member: '#3b82f6', viewer: '#64748b' }

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  if (!org) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Workspace" description="Informacion de tu organizacion">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}>
            {org.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>{org.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '2px' }}>
              {members.length} miembro{members.length !== 1 ? 's' : ''} · Plan {org.plan}
            </p>
          </div>
        </div>
      </Section>

      {(myRole === 'owner' || myRole === 'admin') && (
        <Section title="Invitar al equipo" description="Envia un enlace de acceso por email">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              value={email}
              onChange={function(e) { setEmail(e.target.value) }}
              placeholder="email@empresa.com"
              type="email"
              style={Object.assign({}, INP, { flex: 1, minWidth: '200px' })}
              onKeyDown={function(e) { if (e.key === 'Enter') handleInvite() }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <select value={role} onChange={function(e) { setRole(e.target.value) }}
              style={Object.assign({}, SEL, { width: '130px', flexShrink: 0 })}
            >
              <option value="admin">Admin</option>
              <option value="member">Miembro</option>
              <option value="viewer">Lector</option>
            </select>
            <button type="button" onClick={handleInvite} disabled={inviting || !email.trim()}
              style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: inviting || !email.trim() ? 'not-allowed' : 'pointer', opacity: inviting || !email.trim() ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {inviting ? 'Enviando...' : 'Invitar'}
            </button>
          </div>
        </Section>
      )}

      <Section title={'Miembros (' + members.length + ')'} description="Personas con acceso a tu workspace">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(function(m) {
            var profile   = m.profiles || {}
            var name      = profile.full_name || 'Usuario'
            var roleColor = ROLE_COLORS[m.role] || '#64748b'
            var isOwner   = m.role === 'owner'
            var canManage = (myRole === 'owner' || myRole === 'admin') && !isOwner

            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                    {name}
                    {isOwner && <span style={{ fontSize: '10px', color: 'var(--text-5)', marginLeft: '6px' }}>(propietario)</span>}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                    {m.joined_at ? 'Desde ' + new Date(m.joined_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : 'Pendiente'}
                  </p>
                </div>
                {m.role === 'viewer' && (myRole === 'owner' || myRole === 'admin') && (
                  <button type="button" onClick={function() { setManagingAccess(m) }}
                    style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Gestionar accesos</button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {canManage ? (
                    <select value={m.role} onChange={function(e) { handleRoleChange(m.id, e.target.value) }}
                      style={{ background: 'var(--bg-4)', border: '1px solid var(--border)', color: roleColor, borderRadius: '6px', fontSize: '11px', padding: '4px 8px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Miembro</option>
                      <option value="viewer">Lector</option>
                    </select>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: roleColor + '20', color: roleColor }}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  )}
                  {canManage && (
                    <button type="button" onClick={function() { handleRemove(m.id, name) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px', transition: 'color 0.1s' }}
                      onMouseEnter={function(e) { e.currentTarget.style.color = '#e63946' }}
                      onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(230,57,70,0.5)' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {invitations.length > 0 && (
        <Section title={'Invitaciones pendientes (' + invitations.length + ')'} description="Esperando que acepten la invitacion">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invitations.map(function(inv) {
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    ✉️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.email}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                      Rol: {inv.role} · Expira: {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <button type="button" onClick={function() { handleCancelInvite(inv.id) }}
                    style={{ padding: '4px 10px', borderRadius: '6px', background: 'none', border: '1px solid rgba(230,57,70,0.2)', color: 'var(--brand)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Cancelar</button>
                </div>
              )
            })}
          </div>
        </Section>
      )}
      {managingAccess && (
        <ResourceAccessModal member={managingAccess} orgId={org.id} onClose={function() { setManagingAccess(null) }} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: SEGURIDAD
══════════════════════════════════════════════════════════ */
function SecurityTab() {
  var [form,    setForm]    = useState({ newPassword: '', confirmPassword: '' })
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)
  var [showNew, setShowNew] = useState(false)
  var [showCfm, setShowCfm] = useState(false)
  var [error,   setError]   = useState('')

  function set(k) { return function(e) { setForm(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }); setError('') } }

  function handleSave() {
    setError('')
    if (!form.newPassword || form.newPassword.length < 8) { setError('La contrasena debe tener al menos 8 caracteres'); return }
    if (form.newPassword !== form.confirmPassword) { setError('Las contrasenas no coinciden'); return }
    setSaving(true)
    updatePassword(form.newPassword)
      .then(function() { setSaved(true); setForm({ newPassword: '', confirmPassword: '' }); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setSaving(false) })
  }

  return (
    <div>
      <Section title="Cambiar contrasena" description="Usa una contrasena segura de al menos 8 caracteres">
        <Field label="Nueva contrasena">
          <div style={{ position: 'relative' }}>
            <input type={showNew ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')} placeholder="Nueva contrasena" style={Object.assign({}, INP, { paddingRight: '40px' })} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={function() { setShowNew(function(v) { return !v }) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center' }}
            >
              {showNew ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
            </button>
          </div>
        </Field>
        <Field label="Confirmar contrasena">
          <div style={{ position: 'relative' }}>
            <input type={showCfm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repite la contrasena" style={Object.assign({}, INP, { paddingRight: '40px' })} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={function() { setShowCfm(function(v) { return !v }) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', alignItems: 'center' }}
            >
              {showCfm ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
            </button>
          </div>
        </Field>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '13px', color: '#e63946' }}>
            <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
            {error}
          </div>
        )}
      </Section>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: ZONA DE PELIGRO
══════════════════════════════════════════════════════════ */
function DangerZoneTab() {
  var [confirming, setConfirming] = useState(null)

  function handleSignOutEverywhere() {
    supabase.auth.signOut({ scope: 'global' })
      .then(function() { window.location.href = '/login' })
      .catch(function(e) { window.alert('Error: ' + e.message) })
  }

  function handleRequestDeletion() {
    var subject = 'Solicitud de eliminacion de cuenta AKIRA'
    var body = 'Hola, quiero solicitar la eliminacion completa de mi cuenta y todos mis datos de AKIRA OS.'
    window.location.href = 'mailto:soporte@akira-os.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
  }

  return (
    <div>
      <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '12px', color: '#f59e0b' }}>
        Las acciones de aqui abajo son delicadas. Leelas bien antes de tocar nada.
      </div>

      <Section title="Cerrar sesión en todos los dispositivos" description="Útil si crees que alguien más tiene acceso a tu cuenta">
        {confirming === 'signout' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={function() { setConfirming(null) }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button type="button" onClick={handleSignOutEverywhere}
              style={{ flex: 2, padding: '9px', borderRadius: '8px', background: '#f59e0b', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Si, cerrar todas las sesiones</button>
          </div>
        ) : (
          <button type="button" onClick={function() { setConfirming('signout') }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >Cerrar sesion en todos los dispositivos</button>
        )}
      </Section>

      <Section title="Eliminar mi cuenta" description="Borra tu cuenta y todos tus datos de forma permanente">
        <p style={{ fontSize: '12px', color: 'var(--text-4)', lineHeight: 1.6 }}>
          Por seguridad, eliminar una cuenta del todo (incluido tu acceso de login) requiere una revision manual — no se puede hacer con un solo clic desde aqui.
          Al pulsar el boton, se abrira tu correo con una solicitud ya redactada; te confirmaremos la eliminacion en cuanto la procesemos.
        </p>
        {confirming === 'delete' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={function() { setConfirming(null) }}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button type="button" onClick={handleRequestDeletion}
              style={{ flex: 2, padding: '9px', borderRadius: '8px', background: '#e63946', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Si, solicitar eliminacion</button>
          </div>
        ) : (
          <button type="button" onClick={function() { setConfirming('delete') }}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
          >Solicitar eliminacion de cuenta</button>
        )}
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: CUENTA
══════════════════════════════════════════════════════════ */
function AccountTab({ user, onSignOut }) {
  var [stats,   setStats]   = useState(null)
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    getAccountStats()
      .then(function(data) { setStats(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  var STAT_ITEMS = stats ? [
    { label: 'Clientes',        value: stats.clients },
    { label: 'Proyectos',       value: stats.projects },
    { label: 'Mov. financieros', value: stats.finance },
    { label: 'Documentos',      value: stats.documents },
    { label: 'Conversaciones IA', value: stats.conversations },
  ] : []

  return (
    <div>
      <Section title="Estadisticas de uso" description="Resumen de los datos en tu cuenta">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {STAT_ITEMS.map(function(s) {
              return (
                <div key={s.label} style={{ padding: '16px', background: 'var(--bg-3)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--brand)', margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '4px' }}>{s.label}</p>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Informacion de cuenta" description="Detalles de tu cuenta en AKIRA">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Email',        value: user ? user.email : '--' },
            { label: 'ID de cuenta', value: user ? user.id.slice(0, 8) + '...' : '--' },
            { label: 'Plan',         value: 'AKIRA Pro' },
            { label: 'Miembro desde', value: user && user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '--' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-4)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{item.value}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Sesion" description="Gestiona tu sesion activa">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Cerrar sesion</p>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '3px' }}>Saldras de tu cuenta en este dispositivo</p>
          </div>
          <button type="button" onClick={onSignOut}
            style={{ padding: '8px 18px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)', color: '#e63946', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >Cerrar sesion</button>
        </div>
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function Settings() {
  var { user, signOut } = useAuth()
  var [activeTab, setActiveTab] = useState('profile')

  // Móvil: 'list' (ver las pestañas) | 'content' (ver el contenido de una pestaña) — NUEVO
  var [mobileStep, setMobileStep] = useState('list')
  var [isMobile, setIsMobile] = useState(false)
  useEffect(function() {
    var mq = window.matchMedia('(max-width: 768px)')
    function update() { setIsMobile(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return function() { mq.removeEventListener('change', update) }
  }, [])

  function selectTab(id) {
    setActiveTab(id)
    setMobileStep('content')
  }

  var TABS = [
    { id: 'profile',       label: 'Perfil',          icon: User },
    { id: 'workspace',     label: 'Workspace',       icon: Building2 },
    { id: 'billing',       label: 'Facturacion',     icon: Receipt },
    { id: 'categories',    label: 'Categorias',      icon: Tag },
    { id: 'templates',     label: 'Plantillas',      icon: FileText },
    { id: 'notifications', label: 'Notificaciones',  icon: Bell },
    { id: 'integrations',  label: 'Integraciones',   icon: Plug },
    { id: 'data',          label: 'Exportar datos',  icon: Download },
    { id: 'audit',         label: 'Auditoria',       icon: History },
    { id: 'team',          label: 'Equipo',          icon: Users2 },
    { id: 'danger',        label: 'Zona de peligro', icon: AlertOctagon },
    { id: 'security',      label: 'Seguridad',       icon: Lock },
    { id: 'account',       label: 'Cuenta',          icon: Database },
    { id: 'automations', label: 'Automatizaciones', icon: Workflow },
  ]

  var activeTabInfo = TABS.find(function(t) { return t.id === activeTab })
  var showListPane    = !isMobile || mobileStep === 'list'
  var showContentPane = !isMobile || mobileStep === 'content'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Configuracion"
        description="Gestiona tu perfil, workspace y preferencias"
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar de tabs — en móvil, pantalla completa hasta que se elige una */}
        {showListPane && (
          <div style={{ width: isMobile ? '100%' : '220px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '16px 10px', background: 'rgba(255,255,255,0.01)', overflowY: 'auto' }}>
            {TABS.map(function(tab) {
              var Icon   = tab.icon
              var active = activeTab === tab.id
              return (
                <button key={tab.id} type="button" onClick={function() { selectTab(tab.id) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '10px 12px', borderRadius: '8px', border: 'none',
                    background: active && !isMobile ? 'rgba(230,57,70,0.1)' : 'transparent',
                    color: active && !isMobile ? 'var(--brand)' : 'var(--text-4)',
                    fontSize: '13px', fontWeight: active && !isMobile ? 600 : 400,
                    cursor: 'pointer', marginBottom: '2px', textAlign: 'left',
                    transition: 'all 0.1s',
                    borderLeft: active && !isMobile ? '2px solid var(--brand)' : '2px solid transparent',
                  }}
                  onMouseEnter={function(e) { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={function(e) { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  {tab.label}
                  <ChevronRight style={{ width: '13px', height: '13px', marginLeft: 'auto', opacity: isMobile ? 0.4 : (active ? 1 : 0) }} />
                </button>
              )
            })}
          </div>
        )}

        {/* Contenido */}
        {showContentPane && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 20px' : '28px 36px' }}>
            <div style={{ maxWidth: '680px' }}>

              {/* Botón volver, solo en móvil */}
              {isMobile && (
                <button
                  type="button"
                  onClick={function() { setMobileStep('list') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '18px' }}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} />
                  {activeTabInfo ? activeTabInfo.label : 'Volver'}
                </button>
              )}

              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ProfileTab user={user} />
                  </motion.div>
                )}
                {activeTab === 'workspace' && (
                  <motion.div key="workspace" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <WorkspaceTab />
                  </motion.div>
                )}
                {activeTab === 'billing' && (
                  <motion.div key="billing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <BillingTab />
                  </motion.div>
                )}
                {activeTab === 'categories' && (
                  <motion.div key="categories" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <CategoriesTab />
                  </motion.div>
                )}
                {activeTab === 'templates' && (
                  <motion.div key="templates" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <TemplatesTab />
                  </motion.div>
                )}
                {activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <NotificationsTab />
                  </motion.div>
                )}
                {activeTab === 'integrations' && (
                  <motion.div key="integrations" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <IntegrationsTab />
                  </motion.div>
                )}
                {activeTab === 'data' && (
                  <motion.div key="data" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <DataExportTab />
                  </motion.div>
                )}
                {activeTab === 'audit' && (
                  <motion.div key="audit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <AuditTab />
                  </motion.div>
                )}
                {activeTab === 'team' && (
                  <motion.div key="team" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <TeamTab />
                  </motion.div>
                )}
                {activeTab === 'danger' && (
                  <motion.div key="danger" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <DangerZoneTab />
                  </motion.div>
                )}
                {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <SecurityTab />
                  </motion.div>
                )}
                {activeTab === 'account' && (
                  <motion.div key="account" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <AccountTab user={user} onSignOut={signOut} />
                  </motion.div>
                )}
                {activeTab === 'automations' && (
                  <motion.div key="automations" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                   <AutomationsTab />
                 </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}