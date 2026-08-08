import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ProjectProgressBar({ project }) {
  // Calcula el progreso de tareas automáticamente
  const progress = useMemo(() => {
    if (!Array.isArray(project.tasks) || project.tasks.length === 0) {
      return { done: 0, total: 0, percentage: 0 };
    }

    const total = project.tasks.length;
    const done = project.tasks.filter(t => t.done).length;
    const percentage = Math.round((done / total) * 100);

    return { done, total, percentage };
  }, [project.tasks]);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-text-2">Progreso</span>
        <span className="text-xs font-bold text-brand-500">{progress.percentage}%</span>
      </div>

      {/* Barra de progreso */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          background: 'var(--bg-4)',
          border: '1px solid var(--border)'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: 0.8
          }}
          className="h-full rounded-full"
          style={{
            background: progress.percentage === 100
              ? 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)'
              : 'linear-gradient(90deg, #e63946 0%, #f97316 100%)',
            boxShadow: progress.percentage > 0
              ? `0 0 8px ${progress.percentage === 100 ? '#22c55e' : '#e63946'}44`
              : 'none'
          }}
        />
      </div>

      {/* Contador de tareas */}
      {progress.total > 0 && (
        <div className="mt-1.5 text-xs text-text-4">
          <span className="font-semibold text-brand-500">{progress.done}</span>
          <span> de {progress.total} tareas completadas</span>
        </div>
      )}

      {/* Estado vacío */}
      {progress.total === 0 && (
        <div className="mt-1.5 text-2xs text-text-5">
          Sin tareas aún
        </div>
      )}
    </div>
  );
}
