import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DocumentsNotion() {
  const [showEditor, setShowEditor] = useState(false)
  const [demoDoc] = useState({
    id: 'demo-1',
    title: 'Mi Primer Documento',
    content: '<p>Comienza a escribir aquí... Prueba escribiendo / para ver las opciones</p>',
    icon: '📝'
  })

  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-surface-0">
      {/* Main content container */}
      <div className="flex flex-col items-center justify-start pt-20 pb-20 px-6 flex-1">

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center">
            <FileText size={48} className="text-text-2" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-5xl font-bold text-center text-text-1 mb-6"
        >
          Documentos
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-text-3 max-w-2xl mb-12 text-base leading-relaxed"
        >
          Organiza y gestiona todos tus documentos en un solo lugar. Crea, edita y comparte archivos con tu equipo de forma segura.
        </motion.p>

        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-surface-2 rounded-xl p-8 max-w-2xl mb-16 w-full"
        >
          <h2 className="text-text-1 text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">📄</span>
            Bienvenido a Documentos
          </h2>

          <p className="text-text-2 mb-6 leading-relaxed">
            Sube, organiza y colabora en documentos con tu equipo. Todo lo que necesitas para mantener tu trabajo organizado.
          </p>

          <p className="text-text-3 text-sm mb-4 font-medium">¿Cómo empezar?</p>
          <ul className="space-y-3 text-text-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-text-3 mt-1">•</span>
              <span>Crea nuevas carpetas para organizar tus documentos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-text-3 mt-1">•</span>
              <span>Sube archivos desde tu computadora o dispositivo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-text-3 mt-1">•</span>
              <span>Comparte acceso con miembros de tu equipo</span>
            </li>
          </ul>
        </motion.div>

        {/* Bottom sections */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full"
        >
          {/* Left section */}
          <div className="space-y-4">
            <h3 className="text-text-1 text-xl font-bold">Funciones</h3>
            <div className="space-y-3">
              <div className="p-4 bg-surface-1 rounded-lg border border-surface-2">
                <p className="text-text-2 text-sm font-medium">🗂️ Organización</p>
                <p className="text-text-3 text-xs mt-2">Sistema de carpetas para mantener tus documentos organizados</p>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg border border-surface-2">
                <p className="text-text-2 text-sm font-medium">🔒 Seguridad</p>
                <p className="text-text-3 text-xs mt-2">Acceso controlado y permisos personalizables por documento</p>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="space-y-4">
            <h3 className="text-text-1 text-xl font-bold">Recursos</h3>
            <div className="space-y-3">
              <div className="p-4 bg-surface-1 rounded-lg border border-surface-2">
                <p className="text-text-2 text-sm font-medium">📝 Tipos soportados</p>
                <p className="text-text-3 text-xs mt-2">PDF, Word, Excel, PowerPoint, imágenes y más</p>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg border border-surface-2">
                <p className="text-text-2 text-sm font-medium">⚡ Búsqueda rápida</p>
                <p className="text-text-3 text-xs mt-2">Encuentra archivos al instante con búsqueda integrada</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
