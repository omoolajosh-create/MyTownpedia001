
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  MapPin, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Globe,
  Newspaper,
  CheckSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useStories } from '@/hooks/useStories'
import { Layout } from '@/components/layout/Layout'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalUsers: number
  totalStories: number
  totalTowns: number
  pendingStories: number
  publishedStories: number
  totalComments: number
}

export default function AdminDashboard() {
  const { user, profile, loading, isAdmin } = useAuth()
  const { stories, fetchAllStories } = useStories()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStories: 0,
    totalTowns: 0,
    pendingStories: 0,
    publishedStories: 0,
    totalComments: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [pendingCounts, setPendingCounts] = useState({
    tributes: 0,
    partners: 0,
    events: 0,
    diasporaPosts: 0,
    donations: 0,
    campaigns: 0,
    news: 0,
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
      return
    }

    if (user && isAdmin) {
      fetchDashboardStats()
      fetchAllStories()
      fetchPendingCounts()
    }
  }, [user, isAdmin, loading, navigate])

  useEffect(() => {
    // Update stats when stories are loaded
    if (stories.length > 0) {
      const publishedCount = stories.filter(story => story.is_published).length
      const pendingCount = stories.filter(story => !story.is_published).length
      
      setStats(prev => ({
        ...prev,
        totalStories: stories.length,
        publishedStories: publishedCount,
        pendingStories: pendingCount,
      }))
    }
  }, [stories])

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...')
      
      const [
        usersResponse,
        storiesResponse,
        townsResponse,
        commentsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('stories').select('id, is_published', { count: 'exact' }),
        supabase.from('towns').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' })
      ])

      console.log('Stories response:', storiesResponse)

      const storiesData = storiesResponse.data || []
      const publishedStories = storiesData.filter(story => story.is_published).length
      const pendingStories = storiesData.filter(story => !story.is_published).length

      const newStats = {
        totalUsers: usersResponse.count || 0,
        totalStories: storiesResponse.count || 0,
        totalTowns: townsResponse.count || 0,
        pendingStories,
        publishedStories,
        totalComments: commentsResponse.count || 0,
      }
      
      console.log('Dashboard stats:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchPendingCounts = async () => {
    try {
      const [tributesRes, partnersRes, eventsRes, diasporaRes, donationsRes, campaignsRes] = await Promise.all([
        supabase.from('memory_wall').select('id', { count: 'exact' }).eq('is_approved', false),
        supabase.from('community_partners').select('id', { count: 'exact' }).eq('is_approved', false),
        supabase.from('partner_events').select('id', { count: 'exact' }).eq('is_approved', false),
        supabase.from('diaspora_posts').select('id', { count: 'exact' }).eq('is_approved', false),
        supabase.from('campaign_donations').select('id', { count: 'exact' }).eq('payment_status', 'pending'),
        supabase.from('funding_campaigns').select('id', { count: 'exact' }).eq('is_approved', false),
      ]);

      setPendingCounts({
        tributes: tributesRes.count || 0,
        partners: partnersRes.count || 0,
        events: eventsRes.count || 0,
        diasporaPosts: diasporaRes.count || 0,
        donations: donationsRes.count || 0,
        campaigns: campaignsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  }

  const handleApprove = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      
      fetchPendingCounts();
    } catch (error: any) {
      console.error('Error approving:', error);
    }
  }

  const handleReject = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchPendingCounts();
    } catch (error: any) {
      console.error('Error rejecting:', error);
    }
  }

  if (loading || loadingStats) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered members',
      color: 'text-accent'
    },
    {
      title: 'Total Stories',
      value: stats.totalStories,
      icon: BookOpen,
      description: 'All stories submitted',
      color: 'text-heritage-forest'
    },
    {
      title: 'Towns Featured',
      value: stats.totalTowns,
      icon: MapPin,
      description: 'Communities represented',
      color: 'text-primary'
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      description: 'Community engagement',
      color: 'text-heritage-sunset'
    }
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform activity and content management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-heritage-sunset" />
                <span>Pending Stories</span>
                {stats.pendingStories > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.pendingStories}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stories awaiting review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-heritage-sunset">
                    {stats.pendingStories}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingStories === 0 ? 'All caught up!' : 'Require attention'}
                  </p>
                </div>
                <Button 
                  variant={stats.pendingStories > 0 ? "default" : "outline"} 
                  onClick={() => navigate('/stories')}
                >
                  {stats.pendingStories > 0 ? 'Review Now' : 'View Stories'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-heritage-forest" />
                <span>Published Stories</span>
              </CardTitle>
              <CardDescription>
                Stories currently live on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-heritage-forest">
                    {stats.publishedStories}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Live content
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/stories')}>
                  Manage Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Platform Management</span>
            </CardTitle>
            <CardDescription>
              Quick access to management tools and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/profile')}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/stories')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Content Moderation
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/towns')}>
                <MapPin className="mr-2 h-4 w-4" />
                Manage Towns
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/stories')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Review Comments
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/memory-wall')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Memory Wall ({pendingCounts.tributes} pending)
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/partners')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Partners ({pendingCounts.partners} pending)
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/voices-abroad')}>
                <Globe className="mr-2 h-4 w-4" />
                Diaspora ({pendingCounts.diasporaPosts} pending)
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/donations')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Donations ({pendingCounts.donations} pending)
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/campaigns')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Campaigns ({pendingCounts.campaigns} pending)
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/polls/create')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Create Poll
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/quizzes/create')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/news')}>
                <Newspaper className="mr-2 h-4 w-4" />
                Manage News
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/content-approval')}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Approve Content
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/admin')}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
