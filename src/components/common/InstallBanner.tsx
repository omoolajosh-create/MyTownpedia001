import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('installBannerDismissed') === 'true'
    
    if (!isInstalled && !isDismissed) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowBanner(true)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('installBannerDismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-4 px-4 relative shadow-lg border-b-2 border-primary-foreground/20">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-primary-foreground/10 p-2 rounded-lg animate-pulse">
            <Download className="h-5 w-5 flex-shrink-0" />
          </div>
          <div>
            <p className="text-sm font-bold mb-0.5">
              📱 Get the MyTownpedia App
            </p>
            <p className="text-xs opacity-90">
              Access stories offline • Faster loading • Home screen access
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deferredPrompt ? (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleInstallClick}
              className="font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              Install Free
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="secondary"
              asChild
              className="font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              <Link to="/install">Install Free</Link>
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="h-8 w-8 rounded-lg hover:bg-primary-foreground/10 flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
