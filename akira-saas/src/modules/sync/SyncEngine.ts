import { supabase } from '@/lib/supabase'

export interface SyncChannel {
  name: string
  table: string
  filter?: string
  callback: (payload: any) => void
}

export interface SyncState {
  isOnline: boolean
  syncedAt: string
  channels: Map<string, SyncChannel>
  queue: Array<{ table: string; operation: string; data: any }>
}

export class SyncEngine {
  private static instance: SyncEngine
  private state: SyncState
  private subscriptions: Map<string, any> = new Map()

  private constructor() {
    this.state = {
      isOnline: navigator.onLine,
      syncedAt: new Date().toISOString(),
      channels: new Map(),
      queue: [],
    }

    this.initializeEventListeners()
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine()
    }
    return SyncEngine.instance
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Periodic sync check
    setInterval(() => this.syncOfflineQueue(), 5000)
  }

  private handleOnline(): void {
    this.state.isOnline = true
    console.log('[SyncEngine] Online mode activated')
    this.syncOfflineQueue()
  }

  private handleOffline(): void {
    this.state.isOnline = false
    console.log('[SyncEngine] Offline mode activated')
  }

  subscribe(channel: SyncChannel): void {
    const key = `${channel.table}:${channel.filter || '*'}`

    if (this.subscriptions.has(key)) {
      console.warn(`[SyncEngine] Already subscribed to ${key}`)
      return
    }

    this.state.channels.set(key, channel)

    const subscription = supabase
      .channel(`public:${channel.table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: channel.table,
          filter: channel.filter,
        },
        (payload) => {
          channel.callback(payload)
          this.state.syncedAt = new Date().toISOString()
        }
      )
      .subscribe((status) => {
        console.log(`[SyncEngine] Subscription to ${key}: ${status}`)
      })

    this.subscriptions.set(key, subscription)
  }

  unsubscribe(table: string, filter?: string): void {
    const key = `${table}:${filter || '*'}`
    const subscription = this.subscriptions.get(key)

    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(key)
      this.state.channels.delete(key)
      console.log(`[SyncEngine] Unsubscribed from ${key}`)
    }
  }

  async queueMutation(table: string, operation: string, data: any): Promise<void> {
    if (!this.state.isOnline) {
      this.state.queue.push({ table, operation, data })
      console.log(`[SyncEngine] Queued offline mutation: ${table}.${operation}`)
      return
    }

    try {
      await this.executeMutation(table, operation, data)
    } catch (error) {
      console.error(`[SyncEngine] Mutation failed, queuing:`, error)
      this.state.queue.push({ table, operation, data })
    }
  }

  private async executeMutation(table: string, operation: string, data: any): Promise<void> {
    let result

    switch (operation.toUpperCase()) {
      case 'INSERT':
        result = await supabase.from(table).insert(data)
        break
      case 'UPDATE':
        result = await supabase.from(table).update(data).eq('id', data.id)
        break
      case 'DELETE':
        result = await supabase.from(table).delete().eq('id', data.id)
        break
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    if (result.error) throw result.error
  }

  private async syncOfflineQueue(): Promise<void> {
    if (!this.state.isOnline || this.state.queue.length === 0) return

    console.log(`[SyncEngine] Syncing ${this.state.queue.length} queued mutations`)

    const itemsToProcess = [...this.state.queue]
    this.state.queue = []

    for (const item of itemsToProcess) {
      try {
        await this.executeMutation(item.table, item.operation, item.data)
        console.log(`[SyncEngine] Synced: ${item.table}.${item.operation}`)
      } catch (error) {
        console.error(`[SyncEngine] Failed to sync mutation, requeueing:`, error)
        this.state.queue.push(item)
      }
    }
  }

  getState(): Readonly<SyncState> {
    return Object.freeze({ ...this.state })
  }

  getQueueLength(): number {
    return this.state.queue.length
  }

  isOnline(): boolean {
    return this.state.isOnline
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => supabase.removeChannel(sub))
    this.subscriptions.clear()
    this.state.channels.clear()
    console.log('[SyncEngine] All subscriptions cleared')
  }
}

export const syncEngine = SyncEngine.getInstance()

