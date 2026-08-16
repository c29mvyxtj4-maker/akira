import { Copy, Trash2, MessageSquare } from 'lucide-react'

export default function BlockRenderer({ block, onUpdate, onDelete, canEdit = true }) {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'paragraph':
        return <p className="text-base text-text-1">{block.content.text}</p>
      case 'heading':
        const HeadingTag = `h${block.content.level || 1}`
        return <HeadingTag className="font-bold mb-2">{block.content.text}</HeadingTag>
      case 'table':
        return <div className="text-sm text-text-3">Table block - coming soon</div>
      case 'chart':
        return <div className="text-sm text-text-3">Chart block - coming soon</div>
      case 'calendar':
        return <div className="text-sm text-text-3">Calendar block - coming soon</div>
      case 'kanban':
        return <div className="text-sm text-text-3">Kanban block - coming soon</div>
      default:
        return <div className="text-sm text-text-3">Unknown block type: {block.type}</div>
    }
  }

  return (
    <div className="group relative p-3 rounded-lg hover:bg-surface-1 transition-colors">
      <div className="flex items-start gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 text-text-3">
          <button className="p-1 hover:bg-surface-2 rounded text-xs" title="Duplicate">
            <Copy size={14} />
          </button>
          <button className="p-1 hover:bg-surface-2 rounded text-xs" title="Comment">
            <MessageSquare size={14} />
          </button>
          <button
            onClick={() => onDelete()}
            className="p-1 hover:bg-danger/10 rounded text-xs text-danger"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex-1">{renderBlockContent()}</div>
      </div>
    </div>
  )
}
