import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Story } from '@/lib/supabase'
import { ArrowLeft, MapPin, Calendar, Eye, Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ReactionButtons } from '@/components/reactions/ReactionButtons'
import { ShareButtons } from '@/components/social/ShareButtons'
import { CommentSection } from '@/components/Comments/CommentSection'
import { SEOHead } from '@/components/common/SEOHead'
import { StoryDetailSkeleton } from '@/components/common/SkeletonLoader'
import { Layout } from '@/components/layout/Layout'
import { useStoryView } from '@/hooks/useViewTracking'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useComments } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export default function StoryDetail() {
  const { id } = useParams()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  
  useStoryView(id!)
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmarks(id!)
  const { comments, loading: commentsLoading, submitComment } = useComments(id!)

  useEffect(() => {
    fetchStory()
  }, [id])

  const fetchStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          town:towns(id, name, slug)
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Story not found')
      if (!data.is_published && data.author_id !== user?.id) {
        throw new Error('Story not found')
      }
      setStory(data as unknown as Story)
    } catch (error) {
      console.error('Error fetching story:', error)
      toast({
        title: 'Error',
        description: 'Failed to load story',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-accent/20 text-accent-foreground'
      case 'historical': return 'bg-primary/20 text-primary'
      case 'cultural': return 'bg-secondary text-secondary-foreground'
      case 'legend': return 'bg-heritage-sunset/20 text-heritage-sunset'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <Layout>
        <StoryDetailSkeleton />
      </Layout>
    )
  }

  if (!story) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <Button asChild>
            <Link to="/stories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
          </Button>
        </div>
      </Layout>
    )
  }

  const storyUrl = window.location.href
  const storyImage = story.featured_image_url || '/og-image.png'

  return (
    <Layout>
      <SEOHead
        title={story.title}
        description={story.content.substring(0, 160)}
        image={storyImage}
        url={storyUrl}
        type="article"
        author={story.author?.full_name}
        publishedTime={story.created_at}
        tags={story.tags || []}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/stories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <Badge className={`capitalize ${getTypeColor(story.story_type)}`}>
                    {story.story_type}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {story.title}
                  </h1>
                  
                  <div className="flex items-center flex-wrap gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(story.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{story.view_count || 0} views</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {story.featured_image_url && (
                <div className="px-6">
                  <img 
                    src={story.featured_image_url} 
                    alt={story.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              )}

              <CardContent className="prose prose-lg max-w-none">
                <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {story.content}
                </div>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t not-prose">
                    {story.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reactions */}
            <Card>
              <CardHeader>
                <CardTitle>How does this story make you feel?</CardTitle>
                <CardDescription>
                  Share your reaction to help others discover this story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReactionButtons storyId={id!} />
              </CardContent>
            </Card>

            {/* Comments */}
            <CommentSection
              comments={comments}
              onSubmitComment={submitComment}
              loading={commentsLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <Bookmark className="mr-2 h-4 w-4" />
                  )}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                
                <div className="flex justify-start">
                  <ShareButtons 
                    url={storyUrl}
                    title={story.title}
                    description={story.content.substring(0, 160)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={story.author?.avatar_url} />
                    <AvatarFallback>
                      {story.author?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{story.author?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">Storyteller</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Town */}
            {story.town && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{story.town.name}</span>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/towns/${story.town.slug}`}>
                      Explore Town
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
