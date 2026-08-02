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
