import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BlockEditor } from './BlockEditor'
import { CommandPalette } from './CommandPalette'
import { NotionTopbar } from './NotionTopbar'
import { NotionPageHeader } from './NotionPageHeader'
import { NotionSidebar } from './NotionSidebar'
import { BlockComments } from './BlockComments'
import { VersionHistory } from './VersionHistory'
import { TrashBin } from './TrashBin'
import { GlobalSearch } from './GlobalSearch'
import { AITranslator } from './AITranslator'
import { DatabaseViews } from './DatabaseViews'
import * as notionService from '@/services/notion.service'
import { useNotion } from '@/hooks/useNotion'
import { PageSpinner } from '@/shared/components/ui/Spinner'

export function NotionEditor({ pageId }) {
  const [page, setPage] = useState(null)
  const [pages, setPages] = useState([])
  const [blocks, setBlocks] = useState([])
  const [comments, setComments] = useState({})
  const [favorites, setFavorites] = useState([])
  const [showCommand, setShowCommand] = useState(false)
  const [commandBlockId, setCommandBlockId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDatabase, setShowDatabase] = useState(false)
  const { createBlock, updateBlock, deleteBlock } = useNotion()

  // Cargar página y bloques
  useEffect(() => {
    async function load() {
      try {
        const pageData = await notionService.getPage(pageId)
        setPage(pageData)

        const blocksData = await notionService.getBlocks(pageId)
        setBlocks(
          blocksData.length > 0
            ? blocksData
            : [
                {
                  id: 'temp-1',
                  page_id: pageId,
                  type: 'paragraph',
                  content: { text: '' },
                  order: 0,
                },
              ]
        )

        // Cargar páginas para sidebar
        const pagesData = await notionService.getPages(pageData?.teamspace_id)
        setPages(pagesData)
      } catch (err) {
        console.error('Error loading page:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [pageId])

  const handleUpdateBlock = async (blockId, updates) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b)))

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

    const blockIndex = blocks.findIndex((b) => b.id === commandBlockId)
    const newOrder = blockIndex + 1

    const newBlock = {
      id: `temp-${Date.now()}`,
      page_id: pageId,
      type: blockType,
      content: blockType === 'callout' ? { text: '', emoji: '💡' } : { text: '' },
      order: newOrder,
    }

    if (commandBlockId.startsWith('temp')) {
      setBlocks((prev) => [...prev.slice(0, newOrder), newBlock, ...prev.slice(newOrder)])
    } else {
      try {
        const created = await createBlock(pageId, blockType, newBlock.content, newOrder)
        setBlocks((prev) => [...prev.slice(0, newOrder), created, ...prev.slice(newOrder)])
      } catch (err) {
        console.error('Error creating block:', err)
      }
    }
  }

  const handleUpdateTitle = async (newTitle) => {
    const updated = { ...page, title: newTitle }
    setPage(updated)
    try {
      if (page?.id) {
        await notionService.updatePage(page.id, { title: newTitle })
      }
    } catch (err) {
      console.warn('Error updating title:', err)
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
      console.warn('Error updating description:', err)
    }
  }

  const handleAddComment = (blockId, text) => {
    setComments((prev) => ({
      ...prev,
      [blockId]: [
        ...(prev[blockId] || []),
        {
          id: Date.now(),
          text,
          author: 'Marc',
          timestamp: 'ahora',
        },
      ],
    }))
  }

  const handleToggleFavorite = (pageId) => {
    setFavorites((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    )
  }

  if (loading) {
    return <PageSpinner label="Cargando página..." />
  }

  return (
    <div className="min-h-screen bg-surface-0 text-text-1 flex">
      {/* Sidebar */}
      <NotionSidebar
        pages={pages}
        onSelectPage={(id) => console.log('Select page:', id)}
        onCreatePage={() => console.log('Create page')}
        onFavoritePage={handleToggleFavorite}
        favorites={favorites}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Global search */}
        <GlobalSearch pages={pages} onSelect={(page) => console.log('Search select:', page)} />

        {/* Topbar */}
        <NotionTopbar page={page} onTranslate={() => {}} onShare={() => {}} />

        {/* Toolbar */}
        <div className="bg-surface-1 border-b border-surface-2 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDatabase(!showDatabase)}
              className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-1 text-sm rounded transition-colors"
            >
              {showDatabase ? '📝 Editor' : '📊 Vistas'}
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <AITranslator pageContent={page?.title} onTranslate={() => {}} />
            <VersionHistory
              pageId={pageId}
              versions={[]}
              onRestore={() => console.log('Restore version')}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto">
          {showDatabase ? (
            // Database views
            <div className="max-w-6xl mx-auto px-6 py-12">
              <DatabaseViews data={blocks} onViewChange={() => {}} />
            </div>
          ) : (
            // Editor view
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
                  <div key={block.id} className="group flex gap-2">
                    {/* Block editor */}
                    <div className="flex-1">
                      <BlockEditor
                        block={block}
                        onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                        onDelete={handleDeleteBlock}
                        onShowMenu={handleShowCommand}
                        isLast={idx === blocks.length - 1}
                      />
                    </div>

                    {/* Comments */}
                    <div className="flex-shrink-0 pt-2">
                      <BlockComments
                        blockId={block.id}
                        comments={comments[block.id] || []}
                        onAddComment={handleAddComment}
                      />
                    </div>
                  </div>
                ))}

                {blocks.length === 0 && (
                  <div className="text-center py-12 text-text-3">
                    <p>Comienza a escribir o presiona "/" para agregar bloques</p>
                  </div>
                )}
              </div>

              {/* Command palette */}
              {showCommand && (
                <CommandPalette
                  onSelect={handleSelectCommand}
                  onClose={() => setShowCommand(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* AKIRA Avatar */}
      <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow z-40 hover:scale-110">
        <span className="text-xl">🤖</span>
      </div>
    </div>
  )
}
