import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Camera, Upload, X, Loader2, Image, Video } from 'lucide-react'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface MediaGalleryUploadProps {
  label: string
  onMediaUpdate: (media: MediaItem[]) => void
  currentMedia?: MediaItem[]
  maxFiles?: number
}

export function MediaGalleryUpload({ 
  label, 
  onMediaUpdate, 
  currentMedia = [],
  maxFiles = 10
}: MediaGalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(currentMedia)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (mediaItems.length + files.length > maxFiles) {
      toast({ 
        title: 'Too many files', 
        description: `Maximum ${maxFiles} files allowed`, 
        variant: 'destructive' 
      })
      return
    }

    setUploading(true)
    const newMediaItems: MediaItem[] = []

    try {
      for (const file of files) {
        // Validate file type
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isImage && !isVideo) {
          toast({ 
            title: 'Invalid file type', 
            description: `${file.name} is not an image or video`, 
            variant: 'destructive' 
          })
          continue
        }

        // Validate file size (max 20MB for videos, 5MB for images)
        const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
        if (file.size > maxSize) {
          toast({ 
            title: 'File too large', 
            description: `${file.name} exceeds ${isVideo ? '20MB' : '5MB'} limit`, 
            variant: 'destructive' 
          })
          continue
        }

        // Upload to Supabase
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const { data: userData } = await supabase.auth.getUser()
        const filePath = `campaigns/${userData?.user?.id || 'anonymous'}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath)

        newMediaItems.push({
          url: publicUrl,
          type: isVideo ? 'video' : 'image'
        })
      }

      const updatedMedia = [...mediaItems, ...newMediaItems]
      setMediaItems(updatedMedia)
      onMediaUpdate(updatedMedia)
      
      toast({ 
        title: 'Success', 
        description: `${newMediaItems.length} file(s) uploaded successfully` 
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({ 
        title: 'Error', 
        description: 'Failed to upload some files', 
        variant: 'destructive' 
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const updatedMedia = mediaItems.filter((_, i) => i !== index)
    setMediaItems(updatedMedia)
    onMediaUpdate(updatedMedia)
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Display uploaded media */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border"
                />
              ) : (
                <div className="relative w-full h-40 bg-muted rounded-lg border flex items-center justify-center">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                  />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs flex items-center gap-1">
                {item.type === 'image' ? (
                  <Image className="h-3 w-3" />
                ) : (
                  <Video className="h-3 w-3" />
                )}
                {item.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      {mediaItems.length < maxFiles && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="media-gallery-upload"
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Media ({mediaItems.length}/{maxFiles})
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Images: Max 5MB each. Videos: Max 20MB each. Up to {maxFiles} files total.
          </p>
        </div>
      )}
    </div>
  )
}