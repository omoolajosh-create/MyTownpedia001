
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusCircle, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useStories } from '@/hooks/useStories'
import { supabase, Town } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { toast } from '@/hooks/use-toast'

export default function SubmitStory() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const preselectedTown = searchParams.get('town')
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [storyType, setStoryType] = useState<'personal' | 'historical' | 'cultural' | 'legend'>('personal')
  const [townName, setTownName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, isAuthenticated, profile, loading: authLoading, isAdmin } = useAuth()
  const { submitStory } = useStories()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Load story data if editing
    if (editId) {
      loadStoryForEdit(editId)
    }

    // Pre-fill town if coming from town page
    if (preselectedTown) {
      setTownName(preselectedTown.replace(/-/g, ' '))
    }
  }, [isAuthenticated, authLoading, navigate, editId, preselectedTown])

  const loadStoryForEdit = async (storyId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          town:towns(name)
        `)
        .eq('id', storyId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Story not found')

      // Check if user owns this story
      if (data.author_id !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own stories",
          variant: "destructive",
        })
        navigate('/stories')
        return
      }

      // Populate form with story data
      setTitle(data.title)
      setContent(data.content)
      setStoryType(data.story_type)
      setTownName(data.town?.name || '')
      setTags(data.tags || [])
      if (data.featured_image_url) {
        setImagePreview(data.featured_image_url)
      }
    } catch (error: any) {
      console.error('Error loading story:', error)
      toast({
        title: "Error",
        description: "Failed to load story for editing",
        variant: "destructive",
      })
      navigate('/stories')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (userId: string) => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !townName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a town name before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      console.log(editId ? 'Updating story...' : 'Creating new story...')
      console.log('User:', user.id)
      console.log('Profile:', profile)

      // If editing, update the existing story
      if (editId) {
        // Upload new image if provided
        let imageUrl = imagePreview
        if (imageFile) {
          imageUrl = await uploadImage(user.id)
        }

        const { error: updateError } = await supabase
          .from('stories')
          .update({
            title,
            content,
            story_type: storyType,
            tags: tags.length > 0 ? tags : null,
            featured_image_url: imageUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId)

        if (updateError) throw updateError

        toast({
          title: "Story updated!",
          description: "Your story has been successfully updated.",
        })
        
        navigate(`/stories/${editId}`)
        return
      }
      
      // First, try to find an existing town with this name
      const { data: existingTown } = await supabase
        .from('towns')
        .select('id')
        .ilike('name', townName.trim())
        .single()

      let townId = existingTown?.id

      // If no town exists, create a new one
      if (!townId) {
        console.log('Creating new town:', townName.trim())
        const { data: newTown, error: townError } = await supabase
          .from('towns')
          .insert([
            {
              name: townName.trim(),
              slug: townName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              description: `Information about ${townName.trim()} will be added soon.`
            }
          ])
          .select('id')
          .single()

        if (townError) {
          console.error('Error creating town:', townError)
          toast({
            title: "Error",
            description: "Could not create town. Please try again.",
            variant: "destructive",
          })
          return
        } else {
          townId = newTown.id
          console.log('Created new town with ID:', townId)
        }
      } else {
        console.log('Using existing town with ID:', townId)
      }

      // Upload image if provided
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(user.id)
      }

      // Create the story
      const storyData = {
        title,
        content,
        story_type: storyType,
        town_id: townId,
        tags: tags.length > 0 ? tags : undefined,
        featured_image_url: imageUrl || undefined
      }

      console.log('Submitting story data:', storyData)
      
      const { data, error } = await submitStory(storyData, user.id)

      if (error) throw error
      
      toast({
        title: "Story submitted!",
        description: isAdmin 
          ? "Your story has been published immediately."
          : "Your story will be reviewed before publication.",
      })
      
      navigate(isAdmin ? '/stories' : '/')
    } catch (error: any) {
      console.error('Error submitting story:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit story",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4 mx-auto" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {editId ? 'Edit Your Story' : 'Share Your Story'}
          </h1>
          <p className="text-muted-foreground">
            {editId 
              ? 'Make changes to your story and save when you\'re done.'
              : 'Help preserve the cultural heritage of your community by sharing personal memories, historical accounts, or traditional stories.'
            }
          </p>
          {isAdmin && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Admin: Your stories will be published immediately
            </p>
          )}
        </div>

        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlusCircle className="h-5 w-5" />
              <span>{editId ? 'Edit Story' : 'Submit a New Story'}</span>
            </CardTitle>
            <CardDescription>
              {editId
                ? "Update your story details below."
                : isAdmin 
                  ? "Your story will be published immediately as you are an admin."
                  : "Your story will be reviewed before publication to ensure quality and appropriateness."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Story Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter a compelling title for your story"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Story Type */}
              <div className="space-y-2">
                <Label htmlFor="story-type">Story Type *</Label>
                <Select value={storyType} onValueChange={(value: any) => setStoryType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select story type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Memory</SelectItem>
                    <SelectItem value="historical">Historical Account</SelectItem>
                    <SelectItem value="cultural">Cultural Tradition</SelectItem>
                    <SelectItem value="legend">Legend/Folklore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Town - Text input */}
              <div className="space-y-2">
                <Label htmlFor="town">Town *</Label>
                <Input
                  id="town"
                  type="text"
                  placeholder="Enter the town this story is about"
                  value={townName}
                  onChange={(e) => setTownName(e.target.value)}
                  disabled={!!editId}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {editId 
                    ? 'Town cannot be changed when editing a story'
                    : 'Enter the name of the town or city where this story takes place.'
                  }
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Story Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Tell your story in detail. Include names, dates, places, and vivid descriptions to bring your story to life..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
                <div className="text-sm text-muted-foreground">
                  {content.length} characters • Minimum 100 characters recommended
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                {imagePreview && (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Upload a photo to accompany your story. On mobile, you can take a photo directly.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Add tags (e.g., family, tradition, festival)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  disabled={submitting || uploading || !title || !content || !townName.trim() || content.length < 50}
                  className="flex-1"
                >
                  {submitting 
                    ? (editId ? 'Updating...' : 'Submitting...') 
                    : uploading 
                      ? 'Uploading Image...' 
                      : editId 
                        ? 'Update Story' 
                        : 'Submit Story'
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(editId ? `/stories/${editId}` : '/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Submission Guidelines:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Stories must be respectful and appropriate for all audiences</li>
                  <li>• Please ensure accuracy when sharing historical information</li>
                  <li>• Personal stories should protect privacy of individuals mentioned</li>
                  {!isAdmin && <li>• All submissions are reviewed before publication</li>}
                  <li>• You retain ownership of your story content</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
