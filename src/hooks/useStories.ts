import { useState, useEffect } from 'react'
import { supabase, Story } from '@/lib/supabase'

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setStories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories')
      console.error('Error fetching stories:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllStories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      console.log('Fetched all stories:', data)
      setStories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories')
      console.error('Error fetching all stories:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStoryById = async (id: string): Promise<Story | null> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching story by ID:', error)
      return null
    }
  }

  const getStoriesByTown = async (townSlug: string): Promise<Story[]> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns!inner(id, name, slug)
        `)
        .eq('towns.slug', townSlug)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching stories by town:', error)
      return []
    }
  }

  const getFeaturedStories = async (limit: number = 6): Promise<Story[]> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured stories:', error)
      return []
    }
  }

  const submitStory = async (storyData: {
    title: string
    content: string
    story_type: string
    town_id: string
    featured_image_url?: string
    tags?: string[]
  }, authorId: string) => {
    try {
      console.log('Submitting story for author:', authorId)
      
      // Check if user is admin by querying the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authorId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw profileError
      }

      console.log('Author profile:', profile)
      const isAdmin = profile?.role === 'admin'
      console.log('Is admin:', isAdmin)

      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          author_id: authorId,
          is_published: isAdmin // Auto-approve admin posts
        })
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .single()

      if (error) throw error
      
      console.log('Story submitted:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Error submitting story:', error)
      return { data: null, error }
    }
  }

  const approveStory = async (storyId: string) => {
    try {
      console.log('Approving story:', storyId)
      
      const { data, error } = await supabase
        .from('stories')
        .update({ is_published: true })
        .eq('id', storyId)
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role),
          town:towns(id, name, slug)
        `)
        .single()

      if (error) throw error
      
      console.log('Story approved:', data)
      
      // Refresh stories list
      await fetchAllStories()
      
      return { data, error: null }
    } catch (error) {
      console.error('Error approving story:', error)
      return { data: null, error }
    }
  }

  const rejectStory = async (storyId: string) => {
    try {
      console.log('Rejecting story:', storyId)
      
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)

      if (error) throw error
      
      console.log('Story rejected and deleted')
      
      // Refresh stories list
      await fetchAllStories()
      
      return { error: null }
    } catch (error) {
      console.error('Error rejecting story:', error)
      return { error }
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return {
    stories,
    loading,
    error,
    refetch: fetchStories,
    fetchAllStories,
    getStoryById,
    getStoriesByTown,
    getFeaturedStories,
    submitStory,
    approveStory,
    rejectStory
  }
}
