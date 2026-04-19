import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/common/ImageUpload'
import { MediaGalleryUpload } from '@/components/common/MediaGalleryUpload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, DollarSign } from 'lucide-react'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

export default function CreateCampaign() {
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'heritage',
    goal_amount: '',
    currency: 'NGN',
    end_date: '',
    cover_image: ''
  })
  const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || authLoading) {
      toast({ title: 'Error', description: 'Please wait while we verify your account', variant: 'destructive' })
      return
    }

    console.log('Creating campaign - isAdmin:', isAdmin)
    setLoading(true)
    try {
      const { error } = await supabase.from('funding_campaigns').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        goal_amount: parseFloat(formData.goal_amount),
        currency: formData.currency,
        end_date: formData.end_date,
        cover_image: formData.cover_image || null,
        media_gallery: mediaGallery,
        created_by: user.id,
        is_approved: isAdmin, // Auto-approve for admins
        is_active: true,
        platform_fee_percentage: 7 // 7% platform fee
      })

      if (error) throw error

      toast({ 
        title: 'Success!', 
        description: isAdmin 
          ? 'Your campaign has been published!' 
          : 'Your campaign has been submitted for approval'
      })
      navigate('/crowdfunding')
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-8">Please sign in to create campaigns</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </Layout>
    )
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead title="Start Campaign" description="Start a crowdfunding campaign" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/crowdfunding')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Start a Campaign</h1>
          </div>
          <p className="text-muted-foreground mb-8">Fund projects that preserve our heritage and build our community</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Restore the Town Hall"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={8}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign, its impact, and how funds will be used..."
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heritage">Heritage Preservation</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="community">Community Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal_amount">Funding Goal *</Label>
                <Input
                  id="goal_amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="end_date">Campaign End Date *</Label>
              <Input
                id="end_date"
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <ImageUpload
              label="Cover Image"
              currentImage={formData.cover_image}
              onUploadComplete={(url) => setFormData({ ...formData, cover_image: url })}
            />

            <MediaGalleryUpload
              label="Campaign Gallery (Images & Videos)"
              currentMedia={mediaGallery}
              onMediaUpdate={setMediaGallery}
              maxFiles={10}
            />

            <div className="bg-muted/50 p-4 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-2">💰 Platform Fee Information</p>
              <p className="text-xs text-muted-foreground">
                A 7% platform fee is automatically deducted from each donation to maintain and improve the platform. 
                You can request withdrawals from your available balance once you start receiving donations.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || authLoading} className="flex-1">
                {loading ? 'Creating...' : 'Start Campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/crowdfunding')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
