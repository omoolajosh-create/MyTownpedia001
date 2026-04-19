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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTowns } from '@/hooks/useTowns'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, MapPin } from 'lucide-react'

export default function CreateTour() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { towns } = useTowns()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    town_id: '',
    cover_image: '',
    duration_minutes: '',
    difficulty: 'easy'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to create tours', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('virtual_tours').insert({
        title: formData.title,
        description: formData.description,
        town_id: formData.town_id || null,
        cover_image: formData.cover_image || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        difficulty: formData.difficulty,
        created_by: user.id,
        is_approved: false
      })

      if (error) throw error

      toast({ title: 'Success!', description: 'Your virtual tour has been submitted for approval' })
      navigate('/virtual-tours')
    } catch (error) {
      console.error('Error creating tour:', error)
      toast({ title: 'Error', description: 'Failed to create tour', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-8">Please sign in to create virtual tours</p>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead title="Create Virtual Tour" description="Create an immersive virtual tour" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/virtual-tours')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tours
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create Virtual Tour</h1>
          </div>
          <p className="text-muted-foreground mb-8">Share an immersive experience of our heritage</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Tour Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Historic Walk Through Araromi Obo"
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
                placeholder="Describe the tour experience..."
              />
            </div>

            <div>
              <Label htmlFor="town_id">Associated Town (Optional)</Label>
              <Select value={formData.town_id} onValueChange={(value) => setFormData({ ...formData, town_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a town" />
                </SelectTrigger>
                <SelectContent>
                  {towns.map((town) => (
                    <SelectItem key={town.id} value={town.id}>
                      {town.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cover_image">Cover Image URL</Label>
              <Input
                id="cover_image"
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Tour'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/virtual-tours')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
