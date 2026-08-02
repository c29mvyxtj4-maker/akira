import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';
import { getTemplatesList, applyTemplate } from '@/services/taskTemplates.service';
import { DUR, EASE } from '@/config/motion';

export default function TaskTemplateSelector({ onApplyTemplate, disabled = false }) {
  const templates = getTemplatesList();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-brand-500" />
        <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider">Templates de tareas</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((template, idx) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: DUR.slow, ease: EASE.out }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onApplyTemplate(template.id)}
            disabled={disabled}
            className="p-3 rounded-lg border border-border hover:border-brand-border transition-all text-left group"
            style={{
              background: 'var(--bg-2)',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: template.color }}
              />
              <span className="text-xs font-semibold text-text-1 group-hover:text-brand-500 transition-colors">
                {template.name}
              </span>
            </div>
            <p className="text-2xs text-text-4">
              <Plus size={10} className="inline mr-1" />
              {template.taskCount} tareas
            </p>
          </motion.button>
        ))}
      </div>

      <p className="text-2xs text-text-5 mt-2">
        Selecciona un template para cargar tareas preestablecidas
      </p>
    </div>
  );
}
