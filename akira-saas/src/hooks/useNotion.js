import { useState, useCallback } from 'react'
import * as notionService from '@/services/notion.service'

export function useNotion() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createBlock = useCallback(async (pageId, type, content = {}, order = 0) => {
    setLoading(true)
    setError(null)
    try {
      const block = await notionService.createBlock(pageId, type, content, order)
      return block
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBlock = useCallback(async (blockId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const block = await notionService.updateBlock(blockId, updates)
      return block
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBlock = useCallback(async (blockId) => {
    setLoading(true)
    setError(null)
    try {
      await notionService.deleteBlock(blockId)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
  }
}
