import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'

export type ReactionType = 'love' | 'fire' | 'touching' | 'inspiring' | 'insightful'

interface ReactionCounts {
  love: number
  fire: number
  touching: number
  inspiring: number
  insightful: number
}

export const useReactions = (storyId: string) => {
  const { user } = useAuth()
  const [reactions, setReactions] = useState<ReactionCounts>({
    love: 0,
    fire: 0,
    touching: 0,
    inspiring: 0,
    insightful: 0,
  })
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReactions()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`story_reactions_${storyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_reactions',
          filter: `story_id=eq.${storyId}`,
        },
        () => {
          fetchReactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storyId, user])

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('story_reactions')
        .select('reaction_type, user_id')
        .eq('story_id', storyId)

      if (error) throw error

      const counts: ReactionCounts = {
        love: 0,
        fire: 0,
        touching: 0,
        inspiring: 0,
        insightful: 0,
      }

      const userReactionSet = new Set<ReactionType>()

      data?.forEach((reaction) => {
        counts[reaction.reaction_type as ReactionType]++
        if (user && reaction.user_id === user.id) {
          userReactionSet.add(reaction.reaction_type as ReactionType)
        }
      })

      setReactions(counts)
      setUserReactions(userReactionSet)
    } catch (error) {
      console.error('Error fetching reactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReaction = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to react to stories',
        variant: 'destructive',
      })
      return
    }

    try {
      const hasReacted = userReactions.has(reactionType)

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType)

        if (error) throw error
      } else {
        // Add reaction
        const { error } = await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType,
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      })
    }
  }

  return { reactions, userReactions, toggleReaction, loading }
}