import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, Search, Trash2, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotionSidebar({ pages, onSelectPage, onCreatePage, onFavoritePage, favorites = [] }) {
  const [expandedFolders, setExpandedFolders] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all, private, shared, favorites, recent

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredPages = pages.filter((page) => {
    if (!searchQuery) return true
    return page.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getDisplayPages = () => {
    if (activeTab === 'favorites') return pages.filter((p) => favorites.includes(p.id))
    if (activeTab === 'private') return pages.filter((p) => !p.shared)
    if (activeTab === 'shared') return pages.filter((p) => p.shared)
    if (activeTab === 'recent') return pages.slice(0, 5) // últimas 5
    return filteredPages
  }

  const displayPages = getDisplayPages()

  return (
    <div className="w-64 bg-surface-1 border-r border-surface-2 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-surface-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div>
            <div className="text-sm font-bold text-text-1">Mi Workspace</div>
            <div className="text-xs text-text-3">Equipo Principal</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-3" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-2 border border-surface-3 rounded text-sm text-text-1 placeholder-text-3 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 border-b border-surface-2 text-xs">
        {['all', 'private', 'shared', 'favorites', 'recent'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-surface-2 text-text-2 hover:bg-surface-3'
            }`}
          >
            {tab === 'all' && '📄'}
            {tab === 'private' && '🔒'}
            {tab === 'shared' && '👥'}
            {tab === 'favorites' && '⭐'}
            {tab === 'recent' && '🕐'}
          </button>
        ))}
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displayPages.length === 0 ? (
          <div className="text-center py-8 text-text-3">
            <p className="text-sm">No hay páginas</p>
          </div>
        ) : (
          displayPages.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              isFavorite={favorites.includes(page.id)}
              onSelect={() => onSelectPage(page.id)}
              onFavorite={() => onFavoritePage(page.id)}
              expanded={expandedFolders[page.id]}
              onToggle={() => toggleFolder(page.id)}
              children={page.children || []}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-2 space-y-2">
        <button
          onClick={onCreatePage}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          <Plus size={16} />
          Nueva página
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface-3 text-text-2 text-sm rounded transition-colors">
          <Trash2 size={16} />
          Papelera
        </button>
      </div>
    </div>
  )
}

function PageTreeItem({ page, isFavorite, onSelect, onFavorite, expanded, onToggle, children }) {
  return (
    <div>
      <motion.div
        whileHover={{ backgroundColor: 'var(--surface-2)' }}
        className="flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group"
        onClick={onSelect}
      >
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="p-0.5 hover:bg-surface-3 rounded"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        <div className="text-lg flex-shrink-0">{page.icon || '📄'}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-1 truncate">{page.title}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-surface-3 rounded"
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      </motion.div>

      {/* Subpáginas */}
      <AnimatePresence>
        {expanded && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-4"
          >
            {children.map((child) => (
              <PageTreeItem
                key={child.id}
                page={child}
                isFavorite={isFavorite}
                onSelect={onSelect}
                onFavorite={onFavorite}
                expanded={expandedFolders[child.id]}
                onToggle={() => onToggle}
                children={child.children || []}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
