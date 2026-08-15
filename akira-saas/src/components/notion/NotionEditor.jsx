import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BlockEditor } from './BlockEditor'
import { CommandPalette } from './CommandPalette'
import { NotionTopbar } from './NotionTopbar'
import { NotionPageHeader } from './NotionPageHeader'
import * as notionService from '@/services/notion.service'
import { useNotion } from '@/hooks/useNotion'
import { PageSpinner } from '@/components/ui/Spinner'

export function NotionEditor({ pageId }) {
  const [page, setPage] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [showCommand, setShowCommand] = useState(false)
  const [commandBlockId, setCommandBlockId] = useState(null)
  const [loading, setLoading] = useState(true)
  const { createBlock, updateBlock, deleteBlock } = useNotion()

  // Cargar página y bloques
  useEffect(() => {
    async function load() {
      try {
        const pageData = await notionService.getPage(pageId)
        setPage(pageData)

        const blocksData = await notionService.getBlocks(pageId)
        setBlocks(blocksData.length > 0 ? blocksData : [
          {
            id: 'temp-1',
            page_id: pageId,
            type: 'paragraph',
            content: { text: '' },
            order: 0,
          },
        ])
      } catch (err) {
        console.error('Error loading page:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [pageId])

  const handleUpdateBlock = async (blockId, updates) => {
    // Actualizar en local primero
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    )

    // Guardar en BD si tiene ID real (no temporal)
    if (!blockId.startsWith('temp')) {
      try {
        await updateBlock(blockId, updates)
      } catch (err) {
        console.error('Error updating block:', err)
      }
    }
  }

  const handleDeleteBlock = async (blockId) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))

    if (!blockId.startsWith('temp')) {
      try {
        await deleteBlock(blockId)
      } catch (err) {
        console.error('Error deleting block:', err)
      }
    }
  }

  const handleShowCommand = (blockId) => {
    setCommandBlockId(blockId)
    setShowCommand(true)
  }

  const handleSelectCommand = async (blockType) => {
    setShowCommand(false)

    // Encontrar índice del bloque actual
    const blockIndex = blocks.findIndex((b) => b.id === commandBlockId)
    const newOrder = blockIndex + 1

    // Crear nuevo bloque
    const newBlock = {
      id: `temp-${Date.now()}`,
      page_id: pageId,
      type: blockType,
      content: blockType === 'callout' ? { text: '', emoji: '💡' } : { text: '' },
      order: newOrder,
    }

    // Si es temporal, insertar en local
    if (commandBlockId.startsWith('temp')) {
      setBlocks((prev) => [...prev.slice(0, newOrder), newBlock, ...prev.slice(newOrder)])
    } else {
      // Si es real, crear en BD y luego insertar
      try {
        const created = await createBlock(pageId, blockType, newBlock.content, newOrder)
        setBlocks((prev) => [...prev.slice(0, newOrder), created, ...prev.slice(newOrder)])
      } catch (err) {
        console.error('Error creating block:', err)
      }
    }
  }

  if (loading) {
    return <PageSpinner label="Cargando página..." />
  }

  const handleUpdateTitle = async (newTitle) => {
    const updated = { ...page, title: newTitle }
    setPage(updated)
    try {
      if (page?.id) {
        await notionService.updatePage(page.id, { title: newTitle })
      }
    } catch (err) {
      console.warn('[NotionEditor] Error updating title:', err)
    }
  }

  const handleUpdateDescription = async (newDesc) => {
    const updated = { ...page, description: newDesc }
    setPage(updated)
    try {
      if (page?.id) {
        await notionService.updatePage(page.id, { description: newDesc })
      }
    } catch (err) {
      console.warn('[NotionEditor] Error updating description:', err)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 text-text-1 flex flex-col">
      {/* Topbar */}
      <NotionTopbar
        page={page}
        onTranslate={() => alert('Traducir a: Español')}
        onShare={() => alert('Compartir página')}
      />

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Page Header */}
          <NotionPageHeader
            page={page}
            onUpdateTitle={handleUpdateTitle}
            onUpdateDescription={handleUpdateDescription}
          />

          {/* Bloques */}
          <div className="space-y-2">
            {blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                onDelete={handleDeleteBlock}
                onShowMenu={handleShowCommand}
                isLast={idx === blocks.length - 1}
              />
            ))}

            {/* Placeholder si no hay bloques */}
            {blocks.length === 0 && (
              <div className="text-center py-12 text-text-3">
                <p>Comienza a escribir o presiona "/" para agregar bloques</p>
              </div>
            )}
          </div>

          {/* Command palette */}
          {showCommand && (
            <CommandPalette onSelect={handleSelectCommand} onClose={() => setShowCommand(false)} />
          )}
        </div>
      </div>

      {/* AKIRA Avatar (esquina inferior derecha) */}
      <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow z-40">
        <span className="text-xl">🤖</span>
      </div>
    </div>
  )
}
