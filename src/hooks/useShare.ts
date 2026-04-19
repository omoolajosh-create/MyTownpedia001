import { toast } from '@/hooks/use-toast'

export const useShare = () => {
  const shareContent = async (title: string, text: string, url: string) => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
        toast({
          title: "Shared successfully",
          description: "Content has been shared",
        })
      } catch (error: any) {
        // User cancelled the share or error occurred
        if (error.name !== 'AbortError') {
          fallbackShare(url)
        }
      }
    } else {
      // Fallback to copying link
      fallbackShare(url)
    }
  }

  const fallbackShare = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Share",
          description: url,
          variant: "destructive",
        })
      })
  }

  return { shareContent }
}
