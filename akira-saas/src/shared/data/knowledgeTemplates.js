// Contenido en formato TipTap (el mismo que usa tu editor), listo para insertarse tal cual

function heading(level, text) {
  return { type: 'heading', attrs: { level: level }, content: [{ type: 'text', text: text }] }
}
function paragraph(text) {
  return { type: 'paragraph', content: text ? [{ type: 'text', text: text }] : [] }
}
function bulletList(items) {
  return {
    type: 'bulletList',
    content: items.map(function(t) { return { type: 'listItem', content: [paragraph(t)] } }),
  }
}

export var KNOWLEDGE_TEMPLATES = [
  {
    id: 'onboarding',
    name: 'Manual de onboarding de cliente',
    icon: '👋',
    description: 'Que hacer desde que un cliente firma hasta que empieza el trabajo',
    defaultTitle: 'Onboarding — [Nombre del cliente]',
    content: {
      type: 'doc',
      content: [
        heading(1, 'Onboarding de cliente nuevo'),
        paragraph('Guia paso a paso para arrancar bien con un cliente recien firmado.'),
        heading(2, '1. Primer contacto'),
        bulletList(['Enviar email de bienvenida', 'Agendar llamada inicial', 'Compartir acceso al Portal de cliente']),
        heading(2, '2. Recogida de informacion'),
        bulletList(['Brief detallado del proyecto', 'Referencias visuales', 'Plazos y fechas clave', 'Datos de facturacion']),
        heading(2, '3. Kickoff interno'),
        bulletList(['Crear proyecto en AKIRA', 'Asignar presupuesto', 'Definir tareas iniciales']),
        heading(2, 'Notas'),
        paragraph(''),
      ],
    },
  },
  {
    id: 'delivery_sop',
    name: 'SOP de entrega de proyecto',
    icon: '📦',
    description: 'Checklist para que ninguna entrega se quede coja',
    defaultTitle: 'SOP — Entrega de proyecto',
    content: {
      type: 'doc',
      content: [
        heading(1, 'Procedimiento de entrega'),
        paragraph('Checklist estandar antes de marcar un proyecto como completado.'),
        heading(2, 'Antes de entregar'),
        bulletList(['Revision de calidad final', 'Exportar en los formatos acordados', 'Comprobar nombres de archivo y organizacion', 'Backup de los archivos originales']),
        heading(2, 'Entrega'),
        bulletList(['Subir archivos al Portal del cliente', 'Enviar email de entrega', 'Marcar proyecto como completado en AKIRA']),
        heading(2, 'Despues de entregar'),
        bulletList(['Pedir feedback/reseña (se programa automaticamente)', 'Facturar si queda pendiente', 'Archivar materiales de trabajo']),
      ],
    },
  },
  {
    id: 'process_doc',
    name: 'Documentación de proceso interno',
    icon: '📋',
    description: 'Plantilla en blanco con estructura, para documentar cualquier proceso de tu negocio',
    defaultTitle: 'Proceso — [Nombre]',
    content: {
      type: 'doc',
      content: [
        heading(1, 'Nombre del proceso'),
        paragraph('Descripcion breve de para que sirve este proceso y cuando se usa.'),
        heading(2, 'Pasos'),
        bulletList(['Paso 1', 'Paso 2', 'Paso 3']),
        heading(2, 'Responsable'),
        paragraph(''),
        heading(2, 'Herramientas necesarias'),
        paragraph(''),
      ],
    },
  },
]