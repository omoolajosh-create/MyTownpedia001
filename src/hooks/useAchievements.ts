import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Achievement {
  id: string
  badge_type: string
  badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned_at: string
}

export const useAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  return { achievements, loading }
}

export const getBadgeInfo = (badgeType: string) => {
  const badges: Record<string, { icon: string; name: string; description: string; color: string }> = {
    storyteller: {
      icon: '📖',
      name: 'Storyteller',
      description: 'Shared 10+ stories',
      color: 'from-blue-500 to-blue-600',
    },
    historian: {
      icon: '📚',
      name: 'Historian',
      description: 'Reached 100+ views',
      color: 'from-purple-500 to-purple-600',
    },
    legend: {
      icon: '🏆',
      name: 'Legend',
      description: '1000+ interactions',
      color: 'from-yellow-500 to-yellow-600',
    },
    explorer: {
      icon: '🗺️',
      name: 'Explorer',
      description: 'Visited 10+ towns',
      color: 'from-green-500 to-green-600',
    },
    guardian: {
      icon: '🛡️',
      name: 'Guardian',
      description: 'Protected heritage',
      color: 'from-red-500 to-red-600',
    },
    pioneer: {
      icon: '🌟',
      name: 'Pioneer',
      description: 'Early adopter',
      color: 'from-pink-500 to-pink-600',
    },
    scholar: {
      icon: '🎓',
      name: 'Scholar',
      description: 'Quiz master',
      color: 'from-indigo-500 to-indigo-600',
    },
    mentor: {
      icon: '👥',
      name: 'Mentor',
      description: 'Helped others',
      color: 'from-teal-500 to-teal-600',
    },
    champion: {
      icon: '⚡',
      name: 'Champion',
      description: 'Top contributor',
      color: 'from-orange-500 to-orange-600',
    },
  }

  return badges[badgeType] || badges.storyteller
}