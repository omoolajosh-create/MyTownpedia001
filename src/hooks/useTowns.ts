import { useState, useEffect } from 'react'
import { supabase, Town } from '@/lib/supabase'

export const useTowns = () => {
  const [towns, setTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTowns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('towns')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError
      setTowns(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch towns')
      console.error('Error fetching towns:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTownBySlug = async (slug: string): Promise<Town | null> => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching town by slug:', error)
      return null
    }
  }

  const getFeaturedTowns = async (): Promise<Town[]> => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .eq('is_featured', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured towns:', error)
      return []
    }
  }

  useEffect(() => {
    fetchTowns()
  }, [])

  return {
    towns,
    loading,
    error,
    refetch: fetchTowns,
    getTownBySlug,
    getFeaturedTowns
  }
}