import { supabase } from '@/lib/supabase'

/**
 * Generic service base class to reduce code duplication
 * Usage: new BaseService('table_name').fetch() etc
 */
export class BaseService {
  constructor(tableName) {
    this.tableName = tableName
  }

  async fetch(filters = {}) {
    let query = supabase.from(this.tableName).select('*')

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async fetchOne(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async create(record) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async deleteMany(ids) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .in('id', ids)

    if (error) throw error
  }

  async count(filters = {}) {
    let query = supabase.from(this.tableName).select('id', { count: 'exact', head: true })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { count, error } = await query
    if (error) throw error
    return count
  }
}
