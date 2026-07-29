import { MessageSquare } from 'lucide-react'
import ComingSoonPage from './ComingSoonPage'

export default function Mensajes() {
  return (
    <ComingSoonPage
      icon={MessageSquare}
      title="Mensajes del equipo"
      description="Un espacio interno para tu equipo: chat entre miembros y un tablón de anuncios donde solo tú (owner) puedes publicar."
      bullets={[
        'Chat interno entre los miembros vinculados a tu organización.',
        'Tablón de anuncios: solo el owner cuelga contenido; el resto lo lee.',
        'Requiere el sistema de miembros/equipo (en marcha) para saber quién puede ver y escribir.',
      ]}
    />
  )
}
