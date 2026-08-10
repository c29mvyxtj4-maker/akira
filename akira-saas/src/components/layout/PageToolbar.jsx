import { motion } from 'framer-motion'

/**
 * PageToolbar — Controles contextuales (búsqueda, filtros, acciones)
 *
 * Props:
 *   children: ReactNode (components dentro del toolbar)
 *   align: 'start' | 'between' | 'center' (distribución)
 */
export default function PageToolbar({ children, align = 'between' }) {
  const justifyContent = {
    start: 'flex-start',
    between: 'space-between',
    center: 'center',
  }[align]

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        justifyContent,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {children}
    </motion.div>
  )
}
