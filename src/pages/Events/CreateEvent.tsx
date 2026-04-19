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
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/common/ImageUpload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'cultural',
    start_date: '',
    end_date: '',
    location: '',
    cover_image: '',
    is_virtual: false,
    has_live_stream: false,
    stream_url: '',
    max_attendees: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to create events', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('community_events').insert({
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location || null,
        cover_image: formData.cover_image || null,
        is_virtual: formData.is_virtual,
        has_live_stream: formData.has_live_stream,
        stream_url: formData.stream_url || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        created_by: user.id,
        is_approved: false
      })

      if (error) throw error

      toast({ title: 'Success!', description: 'Your event has been submitted for approval' })
      navigate('/events')
    } catch (error) {
      console.error('Error creating event:', error)
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-8">Please sign in to create events</p>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead title="Create Event" description="Create a community event" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/events')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create Community Event</h1>
          </div>
          <p className="text-muted-foreground mb-8">Bring the community together</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Annual Heritage Festival"
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
                placeholder="Describe the event..."
              />
            </div>

            <div>
              <Label htmlFor="event_type">Event Type *</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date & Time *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Town Square, Araromi Obo"
              />
            </div>

            <div>
              <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <ImageUpload
              label="Cover Image"
              onUploadComplete={(url) => setFormData({ ...formData, cover_image: url })}
              currentImage={formData.cover_image}
            />

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="is_virtual" className="cursor-pointer">Virtual Event</Label>
              <Switch
                id="is_virtual"
                checked={formData.is_virtual}
                onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="has_live_stream" className="cursor-pointer">Enable Live Stream</Label>
                <p className="text-sm text-muted-foreground">Stream this event live</p>
              </div>
              <Switch
                id="has_live_stream"
                checked={formData.has_live_stream}
                onCheckedChange={(checked) => setFormData({ ...formData, has_live_stream: checked })}
              />
            </div>

            {formData.has_live_stream && (
              <div>
                <Label htmlFor="stream_url">Stream URL</Label>
                <Input
                  id="stream_url"
                  type="url"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  placeholder="https://youtube.com/live/..."
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
