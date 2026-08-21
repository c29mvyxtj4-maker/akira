import { motion } from 'framer-motion'

/**
 * PageContent — Contenedor del contenido principal (scrollable)
 *
 * Props:
 *   children: ReactNode (contenido)
 *   padding: boolean (default: true)
 */
export default function PageContent({ children, padding = true }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        height: '100%',
        padding: padding ? 'var(--space-4)' : 0,
        background: 'var(--bg-base)',
      }}
    >
      {children}
    </motion.div>
  )
}
