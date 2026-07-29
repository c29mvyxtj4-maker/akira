import { Inbox } from 'lucide-react'
import ComingSoonPage from './ComingSoonPage'

export default function InboxPage() {
  return (
    <ComingSoonPage
      icon={Inbox}
      title="Bandeja — menciones"
      description="Todo lo que te llega a ti personalmente en un solo sitio: cuando te citan en un proyecto, te asignan una tarea, te etiquetan o te escriben por correo."
      bullets={[
        'Menciones por tag, por tu nombre o por correo.',
        'Como owner apareces citado en todo: proyectos, tareas, presupuestos y facturas.',
        'Requiere vincular personas a proyectos y el sistema de menciones (en marcha).',
      ]}
    />
  )
}
