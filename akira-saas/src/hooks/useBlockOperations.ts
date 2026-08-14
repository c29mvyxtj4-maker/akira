import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { createBlock, updateBlock, reorderBlocks } from '@/services/documents.service'

interface BlockData {
  type: string
  content: string
  metadata?: Record<string, any>
}

/**
 * useBlockOperations - Handles block CRUD operations
 * Insert, update, reorder blocks
 */
export function useBlockOperations(documentId: string) {
  // Insert a new block
  const insertBlock = useCallback(
    async (blockData: BlockData) => {
      try {
        // Get current block count to set position
        const { data: existingBlocks } = await supabase
          .from('document_blocks')
          .select('position')
          .eq('document_id', documentId)
          .order('position', { ascending: false })
          .limit(1)

        const nextPosition = existingBlocks && existingBlocks.length > 0
          ? existingBlocks[0].position + 1
          : 0

        const newBlock = await createBlock(documentId, {
          ...blockData,
          position: nextPosition,
        })

        return newBlock
      } catch (error) {
        console.error('Error inserting block:', error)
        throw error
      }
    },
    [documentId]
  )

  // Update a block
  const updateBlockFn = useCallback(
    async (blockId: string, updates: Partial<BlockData>) => {
      try {
        const updated = await updateBlock(blockId, updates)
        return updated
      } catch (error) {
        console.error('Error updating block:', error)
        throw error
      }
    },
    []
  )

  // Reorder blocks
  const reorderBlocksFn = useCallback(
    async (blockList: Array<{ id: string; position: number }>) => {
      try {
        await reorderBlocks(documentId, blockList as any)
      } catch (error) {
        console.error('Error reordering blocks:', error)
        throw error
      }
    },
    [documentId]
  )

  return {
    insertBlock,
    updateBlock: updateBlockFn,
    reorderBlocks: reorderBlocksFn,
  }
}
