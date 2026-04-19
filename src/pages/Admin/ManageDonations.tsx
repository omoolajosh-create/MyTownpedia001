import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface Donation {
  id: string
  campaign_id: string
  amount: number
  donor_name: string | null
  donor_message: string | null
  account_details: string
  payment_status: string
  is_anonymous: boolean
  created_at: string
  funding_campaigns: {
    title: string
    currency: string
  }
}

export default function ManageDonations() {
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'declined'>('pending')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    fetchDonations()
  }, [isAdmin, filter])

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_donations')
        .select(`
          *,
          funding_campaigns (
            title,
            currency
          )
        `)
        .eq('payment_status', filter)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (error) {
      console.error('Error fetching donations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load donations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (donationId: string, campaignId: string, amount: number, status: 'approved' | 'declined') => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      // Update donation status
      const { error: updateError } = await supabase
        .from('campaign_donations')
        .update({
          payment_status: status,
          reviewed_by: userData.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', donationId)

      if (updateError) throw updateError

      // If approved, update campaign totals
      if (status === 'approved') {
        const { data: campaign } = await supabase
          .from('funding_campaigns')
          .select('current_amount, total_donors')
          .eq('id', campaignId)
          .single()

        if (campaign) {
          await supabase
            .from('funding_campaigns')
            .update({
              current_amount: (campaign.current_amount || 0) + amount,
              total_donors: (campaign.total_donors || 0) + 1,
            })
            .eq('id', campaignId)
        }
      }

      toast({
        title: 'Success',
        description: `Donation ${status}`,
      })

      fetchDonations()
    } catch (error) {
      console.error('Error updating donation:', error)
      toast({
        title: 'Error',
        description: 'Failed to update donation status',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'declined':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Declined</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Loading donations...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead
        title="Manage Donations - Admin"
        description="Review and approve campaign donations"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Donations</h1>
            <p className="text-muted-foreground">Review and verify campaign donations</p>
          </div>
          <Link to="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
          </Button>
          <Button
            variant={filter === 'declined' ? 'default' : 'outline'}
            onClick={() => setFilter('declined')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Declined
          </Button>
        </div>

        {/* Donations List */}
        <div className="space-y-4">
          {donations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No {filter} donations</p>
              </CardContent>
            </Card>
          ) : (
            donations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {donation.funding_campaigns.title}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-heritage-gold">
                          {donation.funding_campaigns.currency} {donation.amount.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>{format(new Date(donation.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                    {getStatusBadge(donation.payment_status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Donor</p>
                      <p className="text-muted-foreground">
                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'Anonymous'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Account Details</p>
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {donation.account_details}
                      </p>
                    </div>
                  </div>

                  {donation.donor_message && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Message</p>
                      <p className="text-muted-foreground text-sm">{donation.donor_message}</p>
                    </div>
                  )}

                  {donation.payment_status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleUpdateStatus(donation.id, donation.campaign_id, donation.amount, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(donation.id, donation.campaign_id, donation.amount, 'declined')}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
