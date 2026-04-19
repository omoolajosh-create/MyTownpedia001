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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function SubmitTimeline() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_year: '',
    event_date: '',
    category: 'cultural',
    featured_image: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to submit events', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('timeline_events').insert({
        title: formData.title,
        description: formData.description,
        event_year: parseInt(formData.event_year),
        event_date: formData.event_date || null,
        category: formData.category,
        featured_image: formData.featured_image || null,
        created_by: user.id,
        is_approved: false
      })

      if (error) throw error

      toast({ title: 'Success!', description: 'Your timeline event has been submitted for approval' })
      navigate('/heritage/timeline')
    } catch (error) {
      console.error('Error submitting event:', error)
      toast({ title: 'Error', description: 'Failed to submit event', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-8">Please sign in to submit timeline events</p>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead title="Submit Timeline Event" description="Submit a historical event to the heritage timeline" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/heritage/timeline')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Timeline
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Submit Timeline Event</h1>
          <p className="text-muted-foreground mb-8">Share a significant historical event from Araromi Obo's rich heritage</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Founding of Araromi Obo"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this historical event..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_year">Year *</Label>
                <Input
                  id="event_year"
                  type="number"
                  required
                  value={formData.event_year}
                  onChange={(e) => setFormData({ ...formData, event_year: e.target.value })}
                  placeholder="e.g., 1820"
                />
              </div>

              <div>
                <Label htmlFor="event_date">Specific Date (Optional)</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="political">Political</SelectItem>
                  <SelectItem value="economic">Economic</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ImageUpload
              label="Featured Image (Optional)"
              currentImage={formData.featured_image}
              onUploadComplete={(url) => setFormData({ ...formData, featured_image: url })}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/heritage/timeline')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
