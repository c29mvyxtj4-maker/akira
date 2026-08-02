// Task templates for common project workflows

export const TASK_TEMPLATES = {
  design: {
    name: 'Flujo de Diseño',
    color: '#8b5cf6',
    tasks: [
      { title: 'Briefing y requerimientos', order: 1, done: false },
      { title: 'Wireframes y mockups', order: 2, done: false },
      { title: 'Diseño visual high-fidelity', order: 3, done: false },
      { title: 'Revisión del cliente', order: 4, done: false },
      { title: 'Ajustes y finales', order: 5, done: false },
      { title: 'Entrega de assets', order: 6, done: false },
    ]
  },

  development: {
    name: 'Flujo de Desarrollo',
    color: '#3b82f6',
    tasks: [
      { title: 'Setup inicial y configuración', order: 1, done: false },
      { title: 'Desarrollo del backend', order: 2, done: false },
      { title: 'Desarrollo del frontend', order: 3, done: false },
      { title: 'Integración y testing', order: 4, done: false },
      { title: 'Revisión de código', order: 5, done: false },
      { title: 'Deploy a staging', order: 6, done: false },
      { title: 'Testing en producción', order: 7, done: false },
      { title: 'Deploy a producción', order: 8, done: false },
    ]
  },

  marketing: {
    name: 'Flujo de Marketing',
    color: '#ec4899',
    tasks: [
      { title: 'Estrategia y planificación', order: 1, done: false },
      { title: 'Creación de contenidos', order: 2, done: false },
      { title: 'Diseño de gráficos', order: 3, done: false },
      { title: 'Copywriting y edición', order: 4, done: false },
      { title: 'Setup de campañas', order: 5, done: false },
      { title: 'A/B testing', order: 6, done: false },
      { title: 'Revisión del cliente', order: 7, done: false },
      { title: 'Lanzamiento', order: 8, done: false },
      { title: 'Monitoreo y optimización', order: 9, done: false },
    ]
  },

  ecommerce: {
    name: 'Flujo de E-commerce',
    color: '#10b981',
    tasks: [
      { title: 'Setup de tienda y productos', order: 1, done: false },
      { title: 'Configuración de pagos', order: 2, done: false },
      { title: 'Integración de inventario', order: 3, done: false },
      { title: 'Email marketing setup', order: 4, done: false },
      { title: 'Testing de checkout', order: 5, done: false },
      { title: 'Análisis y reportes', order: 6, done: false },
      { title: 'Optimización SEO', order: 7, done: false },
      { title: 'Lanzamiento', order: 8, done: false },
    ]
  },

  content: {
    name: 'Flujo de Contenido',
    color: '#f59e0b',
    tasks: [
      { title: 'Investigación y brainstorm', order: 1, done: false },
      { title: 'Outline y estructura', order: 2, done: false },
      { title: 'Escritura de borrador', order: 3, done: false },
      { title: 'Edición y revisión', order: 4, done: false },
      { title: 'Creación de assets visuales', order: 5, done: false },
      { title: 'SEO optimization', order: 6, done: false },
      { title: 'Publicación', order: 7, done: false },
      { title: 'Distribución y promoción', order: 8, done: false },
    ]
  },

  saas: {
    name: 'Flujo SaaS (Onboarding)',
    color: '#06b6d4',
    tasks: [
      { title: 'Crear cuenta de cliente', order: 1, done: false },
      { title: 'Configurar workspace', order: 2, done: false },
      { title: 'Setup inicial', order: 3, done: false },
      { title: 'Capacitación del equipo', order: 4, done: false },
      { title: 'Migración de datos', order: 5, done: false },
      { title: 'Testing y validación', order: 6, done: false },
      { title: 'Go-live', order: 7, done: false },
      { title: 'Soporte post-launch', order: 8, done: false },
    ]
  },

  audiovisual: {
    name: 'Flujo Audiovisual',
    color: '#ef4444',
    tasks: [
      { title: 'Briefing y concepto creativo', order: 1, done: false },
      { title: 'Guión técnico y storyboard', order: 2, done: false },
      { title: 'Preparación de set y equipo', order: 3, done: false },
      { title: 'Pre-producción (casting, locaciones)', order: 4, done: false },
      { title: 'Grabación/Producción', order: 5, done: false },
      { title: 'Ingesta de material y organización', order: 6, done: false },
      { title: 'Edición y postproducción', order: 7, done: false },
      { title: 'Color grading y efectos', order: 8, done: false },
      { title: 'Sonorización y mezcla', order: 9, done: false },
      { title: 'Revisión del cliente', order: 10, done: false },
      { title: 'Renders y exportación finales', order: 11, done: false },
      { title: 'Entrega de archivos', order: 12, done: false },
    ]
  },

  graphicDesign: {
    name: 'Flujo Diseño Gráfico',
    color: '#8b5cf6',
    tasks: [
      { title: 'Briefing y análisis competidor', order: 1, done: false },
      { title: 'Moodboard e inspiración', order: 2, done: false },
      { title: 'Sketches y conceptos iniciales', order: 3, done: false },
      { title: 'Diseño digital en alta resolución', order: 4, done: false },
      { title: 'Revisión del cliente v1', order: 5, done: false },
      { title: 'Ajustes y refinamientos', order: 6, done: false },
      { title: 'Revisión del cliente v2', order: 7, done: false },
      { title: 'Preparación de archivos finales', order: 8, done: false },
      { title: 'Entrega formatos múltiples', order: 9, done: false },
    ]
  },

  communityManagement: {
    name: 'Flujo Community Management',
    color: '#06b6d4',
    tasks: [
      { title: 'Auditoría de redes actuales', order: 1, done: false },
      { title: 'Definir estrategia y tone of voice', order: 2, done: false },
      { title: 'Crear calendario editorial', order: 3, done: false },
      { title: 'Diseñar templates de contenido', order: 4, done: false },
      { title: 'Crear primer lote de contenido', order: 5, done: false },
      { title: 'Agendar publicaciones', order: 6, done: false },
      { title: 'Monitoreo y respuesta a comentarios', order: 7, done: false },
      { title: 'Análisis semanal de métricas', order: 8, done: false },
      { title: 'Optimización de estrategia', order: 9, done: false },
    ]
  },

  clientAcquisition: {
    name: 'Flujo Conseguir Clientes',
    color: '#10b981',
    tasks: [
      { title: 'Definir buyer personas target', order: 1, done: false },
      { title: 'Research y prospecting', order: 2, done: false },
      { title: 'Crear lista de contactos calificados', order: 3, done: false },
      { title: 'Preparar propuesta y pitch', order: 4, done: false },
      { title: 'Outreach inicial (email/LinkedIn)', order: 5, done: false },
      { title: 'Seguimiento y nurturing', order: 6, done: false },
      { title: 'Llamadas de discovery', order: 7, done: false },
      { title: 'Presentación de propuesta', order: 8, done: false },
      { title: 'Negociación de términos', order: 9, done: false },
      { title: 'Firma de contrato', order: 10, done: false },
    ]
  },

  consulting: {
    name: 'Flujo Consultoría/Auditoría',
    color: '#f59e0b',
    tasks: [
      { title: 'Definir scope del proyecto', order: 1, done: false },
      { title: 'Recopilar información de cliente', order: 2, done: false },
      { title: 'Análisis inicial y diagnóstico', order: 3, done: false },
      { title: 'Entrevistas y sesiones de discovery', order: 4, done: false },
      { title: 'Análisis profundo y evaluación', order: 5, done: false },
      { title: 'Documentación de hallazgos', order: 6, done: false },
      { title: 'Crear plan de acción', order: 7, done: false },
      { title: 'Presentación de resultados', order: 8, done: false },
      { title: 'Sesión de Q&A y feedback', order: 9, done: false },
      { title: 'Entrega del informe final', order: 10, done: false },
    ]
  },

  eventProduction: {
    name: 'Flujo Producción de Eventos',
    color: '#ec4899',
    tasks: [
      { title: 'Conceptualización del evento', order: 1, done: false },
      { title: 'Definir presupuesto y timeline', order: 2, done: false },
      { title: 'Reservar venue y proveedores', order: 3, done: false },
      { title: 'Diseño de invitaciones y promoción', order: 4, done: false },
      { title: 'Setup de registro/ticketing', order: 5, done: false },
      { title: 'Coordinar con equipo y proveedores', order: 6, done: false },
      { title: 'Ensayo general de producción', order: 7, done: false },
      { title: 'Montaje de decoración y técnica', order: 8, done: false },
      { title: 'Evento en vivo', order: 9, done: false },
      { title: 'Desmontaje y reportaje post-evento', order: 10, done: false },
    ]
  },

  branding: {
    name: 'Flujo Branding Completo',
    color: '#8b5cf6',
    tasks: [
      { title: 'Workshop estratégico y research', order: 1, done: false },
      { title: 'Definición de brand DNA', order: 2, done: false },
      { title: 'Desarrollo de logotipo', order: 3, done: false },
      { title: 'Creación de manual de marca', order: 4, done: false },
      { title: 'Diseño de paleta de colores', order: 5, done: false },
      { title: 'Selección tipografía y estilo visual', order: 6, done: false },
      { title: 'Aplicaciones en distintos medios', order: 7, done: false },
      { title: 'Revisión y ajustes del cliente', order: 8, done: false },
      { title: 'Preparación de archivos finales', order: 9, done: false },
      { title: 'Entrega y capacitación de uso', order: 10, done: false },
    ]
  }
};

export function getTaskTemplate(templateKey) {
  return TASK_TEMPLATES[templateKey] || null;
}

export function getTemplatesList() {
  return Object.entries(TASK_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    color: template.color,
    taskCount: template.tasks.length
  }));
}

export function applyTemplate(templateKey) {
  const template = getTaskTemplate(templateKey);
  if (!template) return [];
  return [...template.tasks];
}
