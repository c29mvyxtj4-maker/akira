import { lazy, Suspense, useRef, useMemo } from 'react'

/*
 * "Página" del proyecto: un editor tipo Notion (TipTap con comando "/") por
 * proyecto. El contenido se guarda en projects.page_content (JSONB) con un
 * pequeño debounce. El editor es pesado (~500KB) así que se carga en diferido
 * solo al abrir esta pestaña.
 */
var TipTapEditor = lazy(function () { return import('@/components/knowledge/TipTapEditor') })

export default function ProjectPage({ project, onSave }) {
  var timer = useRef(null)

  // Se recalcula SOLO cuando cambia el proyecto (id): así, cuando nuestro propio
  // guardado actualiza page_content, el editor no se reinicia mientras escribes.
  var doc = useMemo(function () {
    var content = (project.page_content && project.page_content.type === 'doc')
      ? project.page_content
      : { type: 'doc', content: [] }
    return { id: project.id, content: content }
  }, [project.id])

  function handleChange(id, json) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(function () { onSave(id, json) }, 700)
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Página del proyecto</h4>
      <div style={{ height: '62vh', minHeight: '420px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-1, var(--bg-base))' }}>
        <Suspense fallback={<div style={{ padding: '24px', color: 'var(--text-4)', fontSize: '13px' }}>Cargando editor…</div>}>
          <TipTapEditor doc={doc} onChange={handleChange} />
        </Suspense>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '8px' }}>
        Escribe <b>/</b> para insertar bloques: encabezados, listas, tablas, tareas, citas y más. Se guarda solo.
      </p>
    </div>
  )
}
