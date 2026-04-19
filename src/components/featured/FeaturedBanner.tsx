import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Story } from '@/lib/supabase'

export const FeaturedBanner = () => {
  const [storyOfWeek, setStoryOfWeek] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedStory()
  }, [])

  const fetchFeaturedStory = async () => {
    try {
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_content')
        .select('story_id')
        .eq('content_type', 'story_of_week')
        .lte('featured_from', new Date().toISOString())
        .gte('featured_until', new Date().toISOString())
        .order('display_order', { ascending: true })
        .limit(1)
        .single()

      if (featuredError || !featuredData) {
        setLoading(false)
        return
      }

      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(full_name, avatar_url),
          town:towns(name, slug)
        `)
        .eq('id', featuredData.story_id)
        .eq('is_published', true)
        .single()

      if (storyError) throw storyError
      setStoryOfWeek(storyData)
    } catch (error) {
      console.error('Error fetching featured story:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !storyOfWeek) return null

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-heritage-sunset to-heritage-gold text-white shadow-glow border-0 animate-fade-in">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative p-8 md:p-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-1">
              Story of the Week
            </Badge>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <TrendingUp className="h-3 w-3" />
              <span>Featured</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {storyOfWeek.title}
          </h2>
          <p className="text-lg text-white/90 mb-6 line-clamp-2">
            {storyOfWeek.content.substring(0, 200)}...
          </p>
          
          <div className="flex items-center gap-4 mb-6">
            {storyOfWeek.author && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {storyOfWeek.author.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium">{storyOfWeek.author.full_name}</span>
              </div>
            )}
            {storyOfWeek.town && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                {storyOfWeek.town.name}
              </Badge>
            )}
          </div>

          <Button 
            asChild 
            size="lg" 
            variant="secondary"
            className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link to={`/stories/${storyOfWeek.id}`}>
              Read This Week's Story <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
    </Card>
  )
}