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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, User } from 'lucide-react'

export default function AddMember() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    maiden_name: '',
    gender: 'male',
    birth_date: '',
    death_date: '',
    birth_place: '',
    occupation: '',
    bio: '',
    profile_photo: '',
    is_living: true,
    is_public: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to add family members', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('family_members').insert({
        user_id: user.id,
        full_name: formData.full_name,
        maiden_name: formData.maiden_name || null,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.death_date || null,
        birth_place: formData.birth_place || null,
        occupation: formData.occupation || null,
        bio: formData.bio || null,
        profile_photo: formData.profile_photo || null,
        is_living: formData.is_living,
        is_public: formData.is_public
      })

      if (error) throw error

      toast({ title: 'Success!', description: 'Family member added successfully' })
      navigate('/family-tree')
    } catch (error) {
      console.error('Error adding member:', error)
      toast({ title: 'Error', description: 'Failed to add family member', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-8">Please sign in to build your family tree</p>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead title="Add Family Member" description="Add a new member to your family tree" />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/family-tree')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Family Tree
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Add Family Member</h1>
          </div>
          <p className="text-muted-foreground mb-8">Preserve your family's legacy for future generations</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <Label htmlFor="maiden_name">Maiden Name (Optional)</Label>
                <Input
                  id="maiden_name"
                  value={formData.maiden_name}
                  onChange={(e) => setFormData({ ...formData, maiden_name: e.target.value })}
                  placeholder="e.g., Smith"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="death_date">Death Date (if applicable)</Label>
                <Input
                  id="death_date"
                  type="date"
                  value={formData.death_date}
                  onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                  disabled={formData.is_living}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_place">Birth Place</Label>
                <Input
                  id="birth_place"
                  value={formData.birth_place}
                  onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  placeholder="e.g., Araromi Obo"
                />
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g., Teacher, Farmer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share their story, accomplishments, and memories..."
              />
            </div>

            <div>
              <Label htmlFor="profile_photo">Profile Photo URL (Optional)</Label>
              <Input
                id="profile_photo"
                type="url"
                value={formData.profile_photo}
                onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="is_living" className="cursor-pointer">Currently Living</Label>
              <Switch
                id="is_living"
                checked={formData.is_living}
                onCheckedChange={(checked) => setFormData({ ...formData, is_living: checked, death_date: checked ? '' : formData.death_date })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_public" className="cursor-pointer">Make Public</Label>
                <p className="text-sm text-muted-foreground">Allow others to view this family member</p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Family Member'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/family-tree')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
