import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { BadgePremium } from '@/components/ui/badge-premium'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, TrendingUp, Users, Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface Campaign {
  id: string
  title: string
  description: string
  category: string
  goal_amount: number
  current_amount: number
  currency: string
  cover_image: string | null
  end_date: string
  is_featured: boolean
  total_donors: number
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All Campaigns' },
    { value: 'heritage_preservation', label: 'Heritage' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'cultural_event', label: 'Cultural Events' },
    { value: 'community_project', label: 'Community' },
    { value: 'emergency_relief', label: 'Emergency' }
  ]

  useEffect(() => {
    fetchCampaigns()
  }, [selectedCategory])

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('funding_campaigns')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, any> = {
      heritage_preservation: 'premium',
      infrastructure: 'default',
      education: 'gold',
      healthcare: 'secondary',
      cultural_event: 'glow',
      community_project: 'premium',
      emergency_relief: 'destructive'
    }
    return colors[category] || 'default'
  }

  return (
    <Layout>
      <SEOHead
        title="Crowdfunding Campaigns"
        description="Support community projects and heritage preservation initiatives. Every contribution makes a difference."
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-mesh-warm">
        <div className="container mx-auto px-4 text-center">
          <BadgePremium variant="premium" className="mb-4">
            Community Funding
          </BadgePremium>
          <h1 className="text-5xl font-bold mb-6 gradient-text-sunset">
            Crowdfunding Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Power community projects together. Support heritage preservation, infrastructure, education, and more.
          </p>
          <Link to="/crowdfunding/create">
            <Button variant="premium" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Start a Campaign
            </Button>
          </Link>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-premium text-white shadow-premium'
                    : 'bg-card text-foreground hover:shadow-warm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">No Active Campaigns</h3>
                <p className="text-muted-foreground mb-8">
                  Be the first to launch a campaign and make a difference in the community
                </p>
                <Link to="/crowdfunding/create">
                  <Button variant="premium">
                    <Plus className="mr-2 h-4 w-4" />
                    Start First Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} to={`/crowdfunding/${campaign.id}`}>
                  <Card className="hover-float h-full">
                    <div className="relative">
                      {campaign.cover_image ? (
                        <img
                          src={campaign.cover_image}
                          alt={campaign.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-premium rounded-t-lg flex items-center justify-center">
                          <Heart className="h-16 w-16 text-white" />
                        </div>
                      )}
                      {campaign.is_featured && (
                        <BadgePremium variant="premium" className="absolute top-4 right-4">
                          Featured
                        </BadgePremium>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <BadgePremium variant={getCategoryColor(campaign.category)} className="mb-3">
                        {campaign.category.replace('_', ' ')}
                      </BadgePremium>
                      <h3 className="text-xl font-bold mb-3">{campaign.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {campaign.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-heritage-gold">
                            {campaign.currency} {campaign.current_amount.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            of {campaign.currency} {campaign.goal_amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={getProgress(campaign.current_amount, campaign.goal_amount)} />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {campaign.total_donors} donors
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
