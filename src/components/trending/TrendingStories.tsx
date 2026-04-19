import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Eye, Heart, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Story } from '@/lib/supabase'

export const TrendingStories = () => {
  const [trending, setTrending] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      // Get stories from the last 7 days, sorted by view count
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(full_name),
          town:towns(name, slug)
        `)
        .eq('is_published', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(5)

      if (error) throw error
      setTrending(data || [])
    } catch (error) {
      console.error('Error fetching trending stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-heritage-sunset" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (trending.length === 0) return null

  return (
    <Card className="shadow-warm hover:shadow-glow transition-all duration-500 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-heritage-sunset" />
          Trending This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trending.map((story, index) => (
          <Link
            key={story.id}
            to={`/stories/${story.id}`}
            className="block group"
          >
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors duration-300">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-xl">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {story.title}
                </h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {story.town && (
                    <Badge variant="secondary" className="text-xs">
                      {story.town.name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{story.view_count}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-2" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}