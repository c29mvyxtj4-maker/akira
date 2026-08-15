import { useState } from 'react'
import { X } from 'lucide-react'

const CALLOUT_COLORS = {
  blue: 'bg-blue-600/20 border-l-4 border-blue-600',
  yellow: 'bg-yellow-600/20 border-l-4 border-yellow-600',
  red: 'bg-red-600/20 border-l-4 border-red-600',
  green: 'bg-green-600/20 border-l-4 border-green-600',
  olive: 'bg-amber-800/30 border-l-4 border-amber-700',
}

export function CalloutBlock({ content, onUpdate, onDelete }) {
  const [color, setColor] = useState(content.color || 'olive')
  const [emoji, setEmoji] = useState(content.emoji || '💡')
  const [text, setText] = useState(content.text || '')

  const handleChange = () => {
    onUpdate?.({ ...content, color, emoji, text })
  }

  return (
    <div className={`rounded-lg p-4 ${CALLOUT_COLORS[color]} space-y-3`}>
      {/* Header con emoji y selector de color */}
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={emoji}
            maxLength="2"
            onChange={(e) => {
              setEmoji(e.target.value)
              handleChange()
            }}
            className="w-10 text-2xl bg-transparent text-center focus:outline-none"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              handleChange()
            }}
            placeholder="Mensaje de bienvenida..."
            className="flex-1 bg-transparent font-bold text-text-1 focus:outline-none placeholder-text-3"
          />
        </div>

        <button
          onClick={onDelete}
          className="text-text-3 hover:text-text-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Selector de color */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(CALLOUT_COLORS).map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c)
              handleChange()
            }}
            className={`w-4 h-4 rounded-full transition-all ${
              c === 'blue' && 'bg-blue-600'
            } ${c === 'yellow' && 'bg-yellow-600'} ${c === 'red' && 'bg-red-600'} ${
              c === 'green' && 'bg-green-600'
            } ${c === 'olive' && 'bg-amber-700'} ${
              color === c ? 'ring-2 ring-offset-2 ring-text-1' : ''
            }`}
          />
        ))}
      </div>

      {/* Lista de contactos */}
      <ul className="space-y-2 text-sm text-text-2 list-disc list-inside">
        <li>Canal Slack: #general</li>
        <li>Email: team@example.com</li>
        <li>Responsable de equipo: Marc</li>
      </ul>
    </div>
  )
}
