import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Clock, User, MapPin, Filter, Check, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Story } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { useAuth } from '@/hooks/useAuth'
import { useStories } from '@/hooks/useStories'
import { toast } from '@/hooks/use-toast'

export default function StoriesList() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { 
    stories, 
    loading, 
    fetchAllStories, 
    approveStory, 
    rejectStory 
  } = useStories()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('published')

  useEffect(() => {
    if (isAdmin) {
      fetchAllStories()
    }
  }, [isAdmin])

  const handleApprove = async (storyId: string) => {
    const { error } = await approveStory(storyId)
    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve story",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Story approved and published",
      })
    }
  }

  const handleReject = async (storyId: string) => {
    const { error } = await rejectStory(storyId)
    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject story",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Story rejected and removed",
      })
    }
  }

  const publishedStories = stories.filter(story => story.is_published)
  const pendingStories = stories.filter(story => !story.is_published)

  const filterStories = (storiesToFilter: Story[]) => {
    return storiesToFilter.filter(story => {
      const matchesSearch = 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.town?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === 'all' || story.story_type === selectedType

      return matchesSearch && matchesType
    })
  }

  const filteredPublishedStories = filterStories(publishedStories)
  const filteredPendingStories = filterStories(pendingStories)

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

  const renderStoryCard = (story: Story, showActions = false) => (
    <Card key={story.id} className="hover:shadow-warm transition-all duration-300 group">
      {story.featured_image_url && (
        <div className="h-48 bg-muted relative overflow-hidden">
          <img 
            src={story.featured_image_url} 
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge className={`capitalize ${getTypeColor(story.story_type)}`}>
              {story.story_type}
            </Badge>
            {!story.is_published && (
              <Badge variant="secondary" className="bg-heritage-sunset/20 text-heritage-sunset">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(story.created_at)}</span>
          </div>
        </div>
        
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {story.title}
        </CardTitle>
        
        <CardDescription className="space-y-1">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>By {story.author?.full_name || 'Anonymous'}</span>
          </div>
          {story.town && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <Link 
                to={`/towns/${story.town.slug}`}
                className="hover:text-primary transition-colors"
              >
                {story.town.name}
              </Link>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {story.content}
        </p>
        
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {story.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {story.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{story.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          {story.is_published && (
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link to={`/stories/${story.id}`}>
                Read Full Story
              </Link>
            </Button>
          )}
          
          {showActions && !story.is_published && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleApprove(story.id)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleReject(story.id)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <SEOHead
        title="African Town Stories & Memories"
        description="Discover personal stories, historical accounts, cultural traditions, and legends from African communities. Share your own story today."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stories & Memories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover personal stories, historical accounts, cultural traditions, and legends 
            from African communities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stories by title, content, author, or town..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="legend">Legend</SelectItem>
            </SelectContent>
          </Select>
          {isAuthenticated && (
            <Button asChild>
              <Link to="/submit">
                <BookOpen className="h-4 w-4 mr-2" />
                Share Story
              </Link>
            </Button>
          )}
        </div>

        {/* Stories Content */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="published">
                Published ({filteredPublishedStories.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filteredPendingStories.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="published" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublishedStories.map(story => renderStoryCard(story))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
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
              ) : filteredPendingStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPendingStories.map(story => renderStoryCard(story, true))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Pending Stories</h3>
                  <p className="text-muted-foreground">
                    All stories have been reviewed and approved.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublishedStories.map(story => renderStoryCard(story))}
              </div>
            )}
          </>
        )}

        {/* No Stories Message */}
        {!loading && filteredPublishedStories.length === 0 && !isAdmin && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stories Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedType !== 'all'
                ? `No stories match your search criteria`
                : 'No stories have been shared yet.'
              }
            </p>
            {isAuthenticated && (
              <Button asChild>
                <Link to="/submit">
                  Share the First Story
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
