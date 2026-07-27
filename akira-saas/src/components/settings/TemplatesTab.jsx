import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { archiveEmailTemplate, archiveProjectTemplate, createEmailTemplate, createProjectTemplate, getEmailTemplates, getProjectTemplates, updateEmailTemplate, updateProjectTemplate } from '@/services/templates.service'
import { INP, Section, Toast } from './_shared'

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


export default TemplatesTab
