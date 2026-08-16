import { FileText, Heading1, Table, BarChart3, Calendar, Layout, Image, ExternalLink, AlertCircle } from 'lucide-react'

export default function SlashCommandPalette({ onSelectCommand, onClose }) {
  const commands = [
    { id: 'heading1', label: 'Heading 1', icon: Heading1, description: 'Large heading' },
    { id: 'heading2', label: 'Heading 2', icon: Heading1, description: 'Medium heading' },
    { id: 'heading3', label: 'Heading 3', icon: Heading1, description: 'Small heading' },
    { id: 'paragraph', label: 'Text', icon: FileText, description: 'Body text' },
    { id: 'table', label: 'Table', icon: Table, description: 'Create a table' },
    { id: 'chart', label: 'Chart', icon: BarChart3, description: 'Insert chart' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Calendar view' },
    { id: 'kanban', label: 'Kanban', icon: Layout, description: 'Task board' },
    { id: 'image', label: 'Image', icon: Image, description: 'Upload image' },
    { id: 'embed', label: 'Embed', icon: ExternalLink, description: 'Embed content' },
    { id: 'callout', label: 'Callout', icon: AlertCircle, description: 'Alert box' },
  ]

  return (
    <div className="absolute top-0 left-0 bg-surface-1 border border-surface-2 rounded-lg shadow-lg p-2 w-64 max-h-96 overflow-y-auto z-50">
      <div className="px-2 py-1 text-xs font-semibold text-text-3 mb-2">Insert block</div>
      {commands.map(cmd => {
        const Icon = cmd.icon
        return (
          <button
            key={cmd.id}
            onClick={() => onSelectCommand(cmd.id)}
            className="w-full text-left px-3 py-2 rounded hover:bg-surface-2 transition-colors mb-1 flex items-center gap-2"
          >
            <Icon size={16} className="text-text-3" />
            <div>
              <div className="text-sm font-medium text-text-1">{cmd.label}</div>
              <div className="text-xs text-text-4">{cmd.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
