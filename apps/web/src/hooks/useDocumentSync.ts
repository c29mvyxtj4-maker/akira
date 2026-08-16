import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { fetchDocument, fetchBlocks, updateBlock, deleteBlock } from '@db/queries/documents.service'

interface Document {
  id: string
  title: string
  content?: string
  org_id: string
  created_by: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  collaborators?: any[]
}

interface Block {
  id: string
  document_id: string
  type: string
  content: string
  metadata: Record<string, any>
  order: number
  created_at: string
  updated_at: string
}

/**
 * useDocumentSync - Real-time document synchronization with Supabase
 * Subscribes to document and block changes
 * Handles optimistic updates
 */
export function useDocumentSync(documentId: string) {
  const [document, setDocument] = useState<Document | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch document
        const doc = await fetchDocument(documentId)
        if (doc) {
          setDocument(doc)
        }

        // Fetch blocks
        const blocksList = await fetchBlocks(documentId)
        setBlocks(blocksList.sort((a, b) => a.order - b.order))
      } catch (err) {
        console.error('Error loading document:', err)
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [documentId])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!documentId) return

    // Subscribe to document updates
    const documentSubscription = supabase
      .channel(`document:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload: any) => {
          setDocument(payload.new)
        }
      )
      .subscribe()

    // Subscribe to block changes
    const blocksSubscription = supabase
      .channel(`document_blocks:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_blocks',
          filter: `document_id=eq.${documentId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setBlocks((prev) => [...prev, payload.new].sort((a, b) => a.order - b.order))
          } else if (payload.eventType === 'UPDATE') {
            setBlocks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b)).sort((a, b) => a.order - b.order)
            )
          } else if (payload.eventType === 'DELETE') {
            setBlocks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      documentSubscription.unsubscribe()
      blocksSubscription.unsubscribe()
    }
  }, [documentId])

  // Sync block changes
  const syncBlock = useCallback(
    async (blockId: string | undefined, updates: Partial<Block>) => {
      try {
        if (blockId) {
          const updated = await updateBlock(blockId, updates)
          setBlocks((prev) =>
            prev.map((b) => (b.id === blockId ? updated : b))
          )
        } else {
          // Update document title
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const docUpdate = await supabase
              .from('documents')
              .update(updates)
              .eq('id', documentId)
              .select()
              .single()

            if (docUpdate.data) {
              setDocument(docUpdate.data)
            }
          }
        }
      } catch (err) {
        console.error('Error syncing block:', err)
        setError(err instanceof Error ? err.message : 'Failed to sync changes')
      }
    },
    [documentId]
  )

  // Delete block
  const deleteBlockFn = useCallback(
    async (blockId: string) => {
      try {
        await deleteBlock(blockId)
        setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      } catch (err) {
        console.error('Error deleting block:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete block')
      }
    },
    []
  )

  return {
    document,
    blocks,
    loading,
    error,
    syncBlock,
    deleteBlock: deleteBlockFn,
  }
}


