import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  MapPin, 
  Users, 
  Calendar, 
  BookOpen, 
  ArrowLeft, 
  Share2, 
  Camera,
  Clock,
  Eye,
  Heart,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase, Town, Story } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useShare } from '@/hooks/useShare'
import { useTownView } from '@/hooks/useViewTracking'
import { useTownFollowers } from '@/hooks/useTownFollowers'
import { Helmet } from 'react-helmet-async'

export default function TownDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuth()
  const { shareContent } = useShare()
  const [town, setTown] = useState<Town | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [storiesLoading, setStoriesLoading] = useState(true)
  
  // Track town view
  useTownView(town?.id)
  
  // Follow functionality
  const { isFollowing, followerCount, toggleFollow, loading: followLoading } = useTownFollowers(town?.id)

  useEffect(() => {
    if (slug) {
      fetchTown()
      fetchTownStories()
    }
  }, [slug])

  const fetchTown = async () => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (!data) throw new Error('Town not found')
      setTown(data)
    } catch (error) {
      console.error('Error fetching town:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTownStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(full_name),
          town:towns!inner(name, slug)
        `)
        .eq('towns.slug', slug)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error('Error fetching town stories:', error)
    } finally {
      setStoriesLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = () => {
    if (town) {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      shareContent(
        town.name,
        `Discover the rich history and culture of ${town.name} on MyTownpedia`,
        url
      )
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!town) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Town Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The town you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/towns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Towns
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${town.name} – MyTownpedia`}</title>
        <meta name="description" content={(town.description || `${town.name} is a vibrant community with rich cultural heritage and history.`).slice(0, 160)} />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/towns/${town.slug}` : `/towns/${town.slug}`} />
        <meta property="og:title" content={`${town.name} – MyTownpedia`} />
        <meta property="og:description" content={(town.description || `${town.name} is a vibrant community with rich cultural heritage and history.`).slice(0, 160)} />
        <meta property="og:type" content="article" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/towns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Towns
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="relative h-64 md:h-96 bg-gradient-earth rounded-lg overflow-hidden">
            {town.featured_image_url ? (
              <img 
                src={town.featured_image_url} 
                alt={town.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="h-24 w-24 text-heritage-earth/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                {town.is_featured && (
                  <Badge className="bg-heritage-gold text-heritage-earth">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{town.name}</h1>
              <div className="flex items-center flex-wrap gap-4 text-white/90">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{town.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{town.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{followerCount} followers</span>
                </div>
                {town.population && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{town.population.toLocaleString()} people</span>
                  </div>
                )}
                {town.founded_year && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {town.founded_year}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-6 right-6 flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant={isFollowing ? "default" : "secondary"}
                size="sm"
                onClick={toggleFollow}
                disabled={followLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">Stories ({stories.length})</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {town.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {town.description || `${town.name} is a vibrant community with rich cultural heritage and history.`}
                    </p>
                  </CardContent>
                </Card>

                {town.history && (
                  <Card>
                    <CardHeader>
                      <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {town.history}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{town.location}</span>
                    </div>
                    {town.population && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Population</span>
                        <span className="font-medium">{town.population.toLocaleString()}</span>
                      </div>
                    )}
                    {town.founded_year && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Founded</span>
                        <span className="font-medium">{town.founded_year}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isAuthenticated && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Share Your Story</CardTitle>
                      <CardDescription>
                        Do you have memories or stories about {town.name}?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link to={`/submit?town=${town.slug}`}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Write a Story
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            {storiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((story) => (
                  <Card key={story.id} className="hover:shadow-warm transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {story.story_type}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(story.created_at)}</span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                      <CardDescription>
                        By {story.author?.full_name || 'Anonymous'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {story.content}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/stories/${story.id}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share a story about {town.name}
                </p>
                {isAuthenticated && (
                  <Button asChild>
                    <Link to={`/submit?town=${town.slug}`}>
                      Write the First Story
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
              <p className="text-muted-foreground">
                Photo and media gallery for {town.name} will be available soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}