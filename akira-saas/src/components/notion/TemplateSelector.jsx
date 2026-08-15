import { useState } from 'react'
import { Zap, Check } from 'lucide-react'
import { motion } from 'framer-motion'

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Página en blanco',
    icon: '📄',
    description: 'Comienza con una página vacía',
    blocks: [],
  },
  {
    id: 'meeting',
    name: 'Nota de reunión',
    icon: '📅',
    description: 'Template para reuniones con agenda y actas',
    blocks: [
      { type: 'heading_1', content: { text: 'Reunión: [Título]' } },
      { type: 'paragraph', content: { text: 'Fecha: [Fecha]\nAsistentes: [Nombres]' } },
      { type: 'heading_2', content: { text: 'Agenda' } },
      { type: 'numbered_list', content: { text: '1. [Tema 1]' } },
      { type: 'heading_2', content: { text: 'Notas' } },
      { type: 'paragraph', content: { text: '[Añade notas aquí]' } },
      { type: 'heading_2', content: { text: 'Decisiones' } },
      { type: 'checklist', content: { text: '[Decisión importante]' } },
    ],
  },
  {
    id: 'project',
    name: 'Proyecto',
    icon: '🚀',
    description: 'Plantilla completa para gestión de proyectos',
    blocks: [
      { type: 'heading_1', content: { text: '[Nombre del Proyecto]' } },
      { type: 'callout', content: { text: 'Resumen del proyecto', emoji: '📌' } },
      { type: 'heading_2', content: { text: 'Objetivos' } },
      { type: 'bulleted_list', content: { text: 'Objetivo 1' } },
      { type: 'heading_2', content: { text: 'Timeline' } },
      { type: 'paragraph', content: { text: 'Fase 1: [Descripción]' } },
      { type: 'heading_2', content: { text: 'Equipo' } },
      { type: 'paragraph', content: { text: 'Líder: [Nombre]' } },
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    icon: '💡',
    description: 'Captura rápida de ideas y conceptos',
    blocks: [
      { type: 'heading_1', content: { text: 'Brainstorm: [Tema]' } },
      { type: 'paragraph', content: { text: 'Fecha: [Fecha]\nParticipantes: [Nombres]' } },
      { type: 'heading_2', content: { text: 'Ideas' } },
      { type: 'toggle', content: { text: 'Categoría: Concepto' } },
      { type: 'heading_2', content: { text: 'Próximos pasos' } },
      { type: 'checklist', content: { text: '[Tarea 1]' } },
    ],
  },
  {
    id: 'wiki',
    name: 'Wiki de conocimiento',
    icon: '📚',
    description: 'Documentación y base de conocimiento',
    blocks: [
      { type: 'heading_1', content: { text: '[Tema]' } },
      { type: 'paragraph', content: { text: 'Descripción general del tema' } },
      { type: 'heading_2', content: { text: 'Tabla de contenidos' } },
      { type: 'bulleted_list', content: { text: 'Sección 1' } },
      { type: 'heading_2', content: { text: 'FAQs' } },
      { type: 'toggle', content: { text: 'Pregunta 1: Respuesta' } },
    ],
  },
]

export function TemplateSelector({ onSelectTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template)
    setShowDetails(true)
  }

  const handleConfirm = () => {
    onSelectTemplate?.(selectedTemplate)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Templates grid */}
      {!showDetails ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-text-1">Elige una plantilla</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTemplate(template)}
                className="bg-surface-1 border border-surface-2 rounded-lg p-6 text-left hover:border-blue-500 transition-colors"
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="font-semibold text-text-1 mb-1">{template.name}</h3>
                <p className="text-sm text-text-3">{template.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        /* Template details */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{selectedTemplate.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-text-1">{selectedTemplate.name}</h2>
                  <p className="text-text-3">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDetails(false)}
              className="text-text-3 hover:text-text-1"
            >
              ✕
            </motion.button>
          </div>

          {/* Preview */}
          <div className="bg-surface-1 border border-surface-2 rounded-lg p-6">
            <h3 className="font-semibold text-text-1 mb-4">Vista previa:</h3>

            <div className="space-y-3 bg-surface-0 p-4 rounded">
              {selectedTemplate.blocks.length === 0 ? (
                <p className="text-text-3 text-sm">Página completamente vacía</p>
              ) : (
                selectedTemplate.blocks.slice(0, 5).map((block, idx) => (
                  <div key={idx} className="text-sm">
                    {block.type === 'heading_1' && (
                      <h1 className="text-lg font-bold text-text-1">{block.content.text}</h1>
                    )}
                    {block.type === 'heading_2' && (
                      <h2 className="text-base font-bold text-text-1">{block.content.text}</h2>
                    )}
                    {(block.type === 'paragraph' || block.type === 'bulleted_list' || block.type === 'numbered_list' || block.type === 'toggle') && (
                      <p className="text-text-2">{block.content.text}</p>
                    )}
                    {block.type === 'callout' && (
                      <div className="bg-amber-800/30 border-l-4 border-amber-700 p-3 rounded text-text-2">
                        <span className="mr-2">{block.content.emoji}</span>
                        <span>{block.content.text}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {selectedTemplate.blocks.length > 5 && (
                <p className="text-xs text-text-3 italic">... y más bloques</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(false)}
              className="px-6 py-2 bg-surface-2 hover:bg-surface-3 text-text-1 rounded-lg transition-colors font-medium"
            >
              Volver
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Check size={18} />
              Usar plantilla
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
