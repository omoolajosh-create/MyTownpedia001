import { useState } from 'react'
import { supabase, Story } from '@/lib/supabase'

export interface SearchFilters {
  query: string
  townId?: string
  storyType?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export const useSearch = () => {
  const [results, setResults] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = async (filters: SearchFilters) => {
    setLoading(true)
    setHasSearched(true)

    try {
      let query = supabase
        .from('stories')
        .select(`
          *,
          author:profiles(full_name, avatar_url),
          town:towns(name, slug)
        `)
        .eq('is_published', true)

      // Text search
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`)
      }

      // Town filter
      if (filters.townId) {
        query = query.eq('town_id', filters.townId)
      }

      // Story type filter
      if (filters.storyType) {
        query = query.eq('story_type', filters.storyType)
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      // Date range
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setResults([])
    setHasSearched(false)
  }

  return { results, loading, hasSearched, search, clearSearch }
}