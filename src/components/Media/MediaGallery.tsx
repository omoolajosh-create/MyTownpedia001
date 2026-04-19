import { useState } from 'react'
import { Camera, Play, Volume2, Download, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MediaGallery as MediaItem } from '@/lib/supabase'

interface MediaGalleryProps {
  media: MediaItem[]
  title?: string
  className?: string
}

export const MediaGallery = ({ media, title, className }: MediaGalleryProps) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return Play
      case 'audio': return Volume2
      default: return Camera
    }
  }

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800'
      case 'audio': return 'bg-green-100 text-green-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const renderMediaPreview = (mediaItem: MediaItem, size: 'small' | 'large' = 'small') => {
    const IconComponent = getMediaIcon(mediaItem.media_type)
    const sizeClasses = size === 'large' ? 'h-96' : 'h-48'

    switch (mediaItem.media_type) {
      case 'image':
        return (
          <img 
            src={mediaItem.media_url} 
            alt={mediaItem.title || 'Media item'}
            className={`w-full ${sizeClasses} object-cover`}
            loading="lazy"
            decoding="async"
          />
        )
      case 'video':
        return (
          <div className={`w-full ${sizeClasses} bg-black relative flex items-center justify-center`}>
            {size === 'large' ? (
              <video 
                src={mediaItem.media_url} 
                controls 
                className="w-full h-full"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="text-center text-white">
                <IconComponent className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Click to play video</p>
              </div>
            )}
          </div>
        )
      case 'audio':
        return (
          <div className={`w-full ${sizeClasses} bg-muted relative flex items-center justify-center`}>
            {size === 'large' ? (
              <audio 
                src={mediaItem.media_url} 
                controls 
                className="w-full"
              >
                Your browser does not support audio playback.
              </audio>
            ) : (
              <div className="text-center">
                <IconComponent className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to play audio</p>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className={`w-full ${sizeClasses} bg-muted flex items-center justify-center`}>
            <IconComponent className="h-12 w-12 text-muted-foreground" />
          </div>
        )
    }
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Media Yet</h3>
        <p className="text-muted-foreground">
          No photos, videos, or audio files have been shared yet.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((mediaItem) => (
          <Card key={mediaItem.id} className="overflow-hidden group cursor-pointer">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative">
                  {renderMediaPreview(mediaItem)}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  
                  {/* Media Type Badge */}
                  <Badge 
                    className={`absolute top-2 left-2 capitalize ${getMediaTypeColor(mediaItem.media_type)}`}
                  >
                    {mediaItem.media_type}
                  </Badge>
                  
                  {/* Featured Badge */}
                  {mediaItem.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-heritage-gold text-heritage-earth">
                      Featured
                    </Badge>
                  )}
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl">
                <div className="space-y-4">
                  {/* Media Display */}
                  <div className="relative">
                    {renderMediaPreview(mediaItem, 'large')}
                  </div>
                  
                  {/* Media Info */}
                  {(mediaItem.title || mediaItem.description) && (
                    <div className="space-y-2">
                      {mediaItem.title && (
                        <h4 className="text-lg font-semibold">{mediaItem.title}</h4>
                      )}
                      {mediaItem.description && (
                        <p className="text-muted-foreground">{mediaItem.description}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {mediaItem.media_type}
                      </Badge>
                      {mediaItem.is_featured && (
                        <Badge className="bg-heritage-gold text-heritage-earth">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={mediaItem.media_url} 
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Card Content */}
            {(mediaItem.title || mediaItem.description) && (
              <CardContent className="p-4">
                {mediaItem.title && (
                  <h4 className="font-medium line-clamp-1 mb-1">{mediaItem.title}</h4>
                )}
                {mediaItem.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mediaItem.description}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}