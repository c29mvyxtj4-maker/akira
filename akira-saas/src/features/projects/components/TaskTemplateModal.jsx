import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';
import { getTemplatesList } from '@db/queries/taskTemplates.service';
import { DUR, EASE } from '@/config/motion';

export default function TaskTemplateModal({ isOpen, onClose, onSelectTemplate, loading = false }) {
  const templates = getTemplatesList();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: DUR.default, ease: EASE.out }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl mx-4 p-6 rounded-2xl bg-surface-1 border border-border shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/10">
                    <Zap size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-1">Selecciona un template</h2>
                    <p className="text-xs text-text-4">Elige un flujo de trabajo predeterminado para tu proyecto</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X size={20} className="text-text-3" />
                </button>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
                {templates.map((template, idx) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: DUR.slow, ease: EASE.out }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectTemplate(template.id)}
                    disabled={loading}
                    className="relative group p-4 rounded-xl border border-border hover:border-brand-500/50 hover:bg-surface-2 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: template.color }}
                      />
                      <span className="text-2xs font-semibold text-text-4 bg-surface-3 px-2 py-1 rounded">
                        {template.taskCount} tareas
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-1 group-hover:text-brand-500 transition-colors pr-6">
                      {template.name}
                    </p>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-brand-500" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-surface-2 transition-colors text-sm font-medium text-text-2 disabled:opacity-50"
                >
                  Saltar por ahora
                </button>
                <p className="text-2xs text-text-5 flex-1 text-center">
                  Puedes agregar tareas manualmente despuÃ©s
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

