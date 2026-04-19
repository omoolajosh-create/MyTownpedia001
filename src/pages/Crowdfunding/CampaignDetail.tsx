import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Heart, Users, Target } from 'lucide-react'
import { ShareButtons } from '@/components/social/ShareButtons'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface Campaign {
  id: string
  title: string
  description: string
  category: string
  goal_amount: number
  current_amount: number
  currency: string
  cover_image: string | null
  media_gallery: MediaItem[]
  end_date: string
  total_donors: number
  account_details: string | null
}

interface Donation {
  id: string
  amount: number
  donor_name: string | null
  donor_message: string | null
  payment_status: string
  created_at: string
  is_anonymous: boolean
}

export default function CampaignDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [donorName, setDonorName] = useState('')
  const [amount, setAmount] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorEmail, setDonorEmail] = useState('')

  useEffect(() => {
    if (id) {
      fetchCampaignDetails()
      fetchDonations()
    }
  }, [id])

  const fetchCampaignDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('funding_campaigns')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .single()

      if (error) throw error
      setCampaign({
        ...data,
        media_gallery: (data.media_gallery as unknown as MediaItem[]) || []
      })
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast({
        title: 'Error',
        description: 'Failed to load campaign details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('campaign_id', id)
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (error) {
      console.error('Error fetching donations:', error)
    }
  }

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount',
        variant: 'destructive',
      })
      return
    }

    if (!donorEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      // Initialize Paystack payment
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          amount: parseFloat(amount),
          email: donorEmail,
          campaignId: id,
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          donorMessage: donorMessage,
          isAnonymous: isAnonymous,
          userId: user?.id || null,
        },
      })

      if (error) throw error

      // Redirect to Paystack payment page
      if (data?.authorizationUrl) {
        window.location.href = data.authorizationUrl
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Loading campaign...</p>
        </div>
      </Layout>
    )
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Campaign not found</p>
        </div>
      </Layout>
    )
  }

  const progress = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)

  return (
    <Layout>
      <SEOHead
        title={campaign.title}
        description={campaign.description.slice(0, 160)}
        image={campaign.cover_image || undefined}
        type="article"
      />

      <div className="container mx-auto px-4 py-12">
        <Link to="/crowdfunding">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {campaign.cover_image && (
              <img
                src={campaign.cover_image}
                alt={campaign.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            )}

            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <Badge>{campaign.category.replace(/_/g, ' ')}</Badge>
                <ShareButtons
                  url={window.location.href}
                  title={campaign.title}
                  description={`Help support: ${campaign.title}. Goal: ${campaign.currency} ${campaign.goal_amount.toLocaleString()}`}
                />
              </div>
              <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
              <p className="text-xs text-muted-foreground mb-4">Campaign ID: {campaign.id}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Media Gallery */}
            {campaign.media_gallery && campaign.media_gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.media_gallery.map((item, index) => (
                      <div key={index} className="relative">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={item.url}
                            controls
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Donor Wall */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-heritage-gold" />
                  Donor Wall ({donations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Be the first to donate!
                  </p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">
                          {donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'Anonymous'}
                        </p>
                        <p className="text-heritage-gold font-bold">
                          {campaign.currency} {donation.amount.toLocaleString()}
                        </p>
                      </div>
                      {donation.donor_message && (
                        <p className="text-sm text-muted-foreground">{donation.donor_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(donation.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold">
                      {campaign.currency} {campaign.current_amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of {campaign.currency} {campaign.goal_amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{progress.toFixed(1)}% funded</p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{campaign.total_donors} donors</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ends {format(new Date(campaign.end_date), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>


            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDonationSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (NGN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount in Naira"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="donorEmail">Email Address *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="donorName">Your Name</Label>
                    <Input
                      id="donorName"
                      placeholder="Enter your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      Donate anonymously
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message of support"
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-heritage-gold hover:bg-heritage-gold-dark text-white"
                    disabled={submitting}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    {submitting ? 'Processing...' : 'Pay with Paystack'}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Paystack
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
