import { useEffect, useState, useCallback } from 'react'
import { syncEngine, SyncChannel, SyncState } from '../SyncEngine'

export function useGlobalSync() {
  const [state, setState] = useState<SyncState>(syncEngine.getState())
  const [queueLength, setQueueLength] = useState(syncEngine.getQueueLength())

  useEffect(() => {
    const interval = setInterval(() => {
      setState(syncEngine.getState())
      setQueueLength(syncEngine.getQueueLength())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const subscribe = useCallback((channel: SyncChannel) => {
    syncEngine.subscribe(channel)
  }, [])

  const unsubscribe = useCallback((table: string, filter?: string) => {
    syncEngine.unsubscribe(table, filter)
  }, [])

  const queueMutation = useCallback(
    (table: string, operation: string, data: any) => {
      return syncEngine.queueMutation(table, operation, data)
    },
    []
  )

  return {
    isOnline: state.isOnline,
    syncedAt: state.syncedAt,
    queueLength,
    channelCount: state.channels.size,
    subscribe,
    unsubscribe,
    queueMutation,
  }
}
