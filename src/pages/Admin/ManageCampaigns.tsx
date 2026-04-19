import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, DollarSign, Clock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

interface Campaign {
  id: string
  title: string
  description: string
  category: string
  goal_amount: number
  currency: string
  cover_image: string | null
  end_date: string
  is_approved: boolean
  created_at: string
  created_by: string
}

export default function ManageCampaigns() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/')
      return
    }

    if (user && isAdmin) {
      fetchCampaigns()
    }
  }, [user, isAdmin, authLoading, navigate, filter])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('funding_campaigns')
        .select('*')
        .eq('is_approved', filter === 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast({ title: 'Error', description: 'Failed to fetch campaigns', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('funding_campaigns')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Success!', description: 'Campaign approved successfully' })
      fetchCampaigns()
    } catch (error) {
      console.error('Error approving campaign:', error)
      toast({ title: 'Error', description: 'Failed to approve campaign', variant: 'destructive' })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('funding_campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Success!', description: 'Campaign rejected and removed' })
      fetchCampaigns()
    } catch (error) {
      console.error('Error rejecting campaign:', error)
      toast({ title: 'Error', description: 'Failed to reject campaign', variant: 'destructive' })
    }
  }

  if (authLoading || !user || !isAdmin) {
    return null
  }

  return (
    <Layout>
      <SEOHead title="Manage Campaigns" description="Approve or reject crowdfunding campaigns" />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Crowdfunding Campaigns</h1>
          <p className="text-muted-foreground">Review and approve community fundraising initiatives</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending Approval
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {filter === 'pending' ? 'No Pending Campaigns' : 'No Approved Campaigns'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'pending' 
                  ? 'All campaigns have been reviewed' 
                  : 'No campaigns have been approved yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {campaign.title}
                        <Badge>{campaign.category.replace('_', ' ')}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {campaign.currency} {campaign.goal_amount.toLocaleString()} goal
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Ends {format(new Date(campaign.end_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    {campaign.cover_image && (
                      <img
                        src={campaign.cover_image}
                        alt={campaign.title}
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {campaign.description}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submitted {format(new Date(campaign.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                  
                  {filter === 'pending' && (
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleApprove(campaign.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Campaign
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(campaign.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Campaign
                      </Button>
                    </div>
                  )}
                  
                  {filter === 'approved' && (
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/crowdfunding/${campaign.id}`)}
                        className="flex-1"
                      >
                        View Campaign
                      </Button>
                      {campaign.created_by === user?.id && (
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(campaign.id)}
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Delete Campaign
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
