import { useState } from 'react'
import { Sparkles, Wand2, CheckCircle2, Lightbulb, Wrench } from 'lucide-react'
import { usePrefs } from '@/shared/hooks/usePreferences'
import { Row, RowSection, Toggle, RowSelect, MiniBtn, INP, onFocus, onBlur } from './_shared'

/*
 * IA de AKIRA (grupo Funciones) –” equivalente a "IA de Notion": personalización
 * del asistente, instrucciones, habilidades y modelo. Persistido en localStorage.
 */
var SKILLS = [
  { key: 'skill_improve', icon: Wand2,        label: 'Mejorar redacción', desc: 'Reescribe un texto para que sea más claro y profesional.' },
  { key: 'skill_fix',     icon: CheckCircle2, label: 'Corregir',          desc: 'Corrige ortografía y gramática manteniendo el tono.' },
  { key: 'skill_explain', icon: Lightbulb,    label: 'Explicar',          desc: 'Explica un texto o concepto de forma sencilla.' },
  { key: 'skill_format',  icon: Wrench,       label: 'Modificar formato', desc: 'Reorganiza el contenido en listas, tablas o encabezados.' },
]

function AITab() {
  var [prefs, setPref] = usePrefs({
    ai_name: 'AKIRA', ai_model: 'gemini-1.5-flash', ai_suggestions: true,
    skill_improve: true, skill_fix: true, skill_explain: true, skill_format: true,
  })
  var [instructions, setInstructions] = useState(function () {
    try { return localStorage.getItem('akira-ai-instructions') || '' } catch (_) { return '' }
  })
  var [savedInstr, setSavedInstr] = useState(false)

  function saveInstructions() {
    try { localStorage.setItem('akira-ai-instructions', instructions) } catch (_) { /* noop */ }
    setSavedInstr(true); setTimeout(function () { setSavedInstr(false) }, 2000)
  }
  function toggle(key) { return function () { setPref(key, !prefs[key]) } }

  return (
    <div>
      <RowSection title="Personalización" description="Elige cómo se llama y se comporta tu asistente de IA.">
        <Row title="Nombre del asistente" description="El nombre que verás al abrir «Preguntar a AKIRA».">
          <input value={prefs.ai_name} onChange={function (e) { setPref('ai_name', e.target.value) }}
            style={Object.assign({}, INP, { width: '180px' })} onFocus={onFocus} onBlur={onBlur} />
        </Row>
        <Row title="Modelo" description="Modelo de lenguaje que impulsa las respuestas del asistente." last>
          <RowSelect value={prefs.ai_model} onChange={function (e) { setPref('ai_model', e.target.value) }}
            options={[
              { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash · rápido' },
              { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro · potente' },
              { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
            ]} />
        </Row>
      </RowSection>

      <RowSection title="Instrucciones" description="Contexto permanente que AKIRA tendrá en cuenta en cada conversación.">
        <div style={{ padding: '14px 0' }}>
          <textarea value={instructions} onChange={function (e) { setInstructions(e.target.value) }}
            rows={4} placeholder="Ej: Soy diseñador freelance. Responde en español, tono directo, y cuando hable de facturas usa euros."
            style={Object.assign({}, INP, { resize: 'vertical' })} onFocus={onFocus} onBlur={onBlur} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <MiniBtn label={savedInstr ? 'Guardado' : 'Guardar instrucciones'} icon={savedInstr ? CheckCircle2 : Sparkles} onClick={saveInstructions} />
          </div>
        </div>
      </RowSection>

      <RowSection title="Habilidades" description="Acciones rápidas que AKIRA puede ejecutar sobre el texto seleccionado.">
        {SKILLS.map(function (s, i) {
          return (
            <Row key={s.key} title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><s.icon style={{ width: '15px', height: '15px', color: 'var(--brand)' }} /> {s.label}</span>}
              description={s.desc} last={i === SKILLS.length - 1}>
              <Toggle checked={prefs[s.key]} onClick={toggle(s.key)} />
            </Row>
          )
        })}
      </RowSection>

      <RowSection title="Comportamiento">
        <Row title="Sugerencias proactivas" description="Permite que AKIRA proponga acciones (crear tareas, facturas│) a partir de tu contexto." last>
          <Toggle checked={prefs.ai_suggestions} onClick={toggle('ai_suggestions')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default AITab

