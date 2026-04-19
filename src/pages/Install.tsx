import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Smartphone, CheckCircle2, Chrome, Apple } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detect Android
    const android = /Android/.test(navigator.userAgent)
    setIsAndroid(android)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    
    setDeferredPrompt(null)
  }

  return (
    <Layout>
      <Helmet>
        <title>Install MyTownpedia App</title>
        <meta name="description" content="Install MyTownpedia on your device for the best experience. Access stories offline and get quick access from your home screen." />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Smartphone className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Free • No App Store Required</span>
          </div>
          <div className="h-24 w-24 rounded-3xl bg-gradient-premium flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Download className="h-12 w-12 text-white" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Get the MyTownpedia App
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Install our free Progressive Web App for the ultimate African heritage experience
          </p>
          
          {/* Quick Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-semibold">Lightning Fast</div>
              <div className="text-xs text-muted-foreground">Instant loading</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm font-semibold">Home Screen</div>
              <div className="text-xs text-muted-foreground">One tap access</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <div className="text-sm font-semibold">Works Offline</div>
              <div className="text-xs text-muted-foreground">No internet needed</div>
            </div>
          </div>
        </div>

        {isInstalled ? (
          <Card className="mb-8 border-heritage-gold bg-heritage-gold/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 text-heritage-gold">
                <CheckCircle2 className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold text-lg">App Installed!</h3>
                  <p className="text-sm text-muted-foreground">MyTownpedia is now installed on your device</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Android/Desktop - Installable */}
            {deferredPrompt && (
              <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Smartphone className="h-6 w-6 text-primary" />
                    Ready to Install!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your device supports instant installation. Click below to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="lg" 
                    className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-shadow"
                    onClick={handleInstallClick}
                  >
                    <Download className="mr-2 h-6 w-6" />
                    Install MyTownpedia Now - Free!
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Takes less than 5 seconds • No app store needed
                  </p>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Install on iPhone or iPad
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to add MyTownpedia to your home screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Tap the Share button</p>
                        <p className="text-sm text-muted-foreground">Look for the share icon (square with arrow pointing up) at the bottom or top of Safari</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Select "Add to Home Screen"</p>
                        <p className="text-sm text-muted-foreground">Scroll down in the share menu and tap "Add to Home Screen"</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Tap "Add" to confirm</p>
                        <p className="text-sm text-muted-foreground">The MyTownpedia icon will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Chrome Instructions */}
            {isAndroid && !deferredPrompt && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    Install on Android
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to install MyTownpedia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Tap the menu button</p>
                        <p className="text-sm text-muted-foreground">Tap the three dots (⋮) in the top right corner of Chrome</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Select "Install app" or "Add to Home screen"</p>
                        <p className="text-sm text-muted-foreground">Look for this option in the menu</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Tap "Install" to confirm</p>
                        <p className="text-sm text-muted-foreground">The MyTownpedia app will be installed on your device</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Benefits Section - Enhanced */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold text-center mb-8">Why Install?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-heritage-sunset to-heritage-sunset/70 flex items-center justify-center mb-4 shadow-lg">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">📡 Works Offline</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access your favorite stories and browse content anytime, even without internet connection
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-heritage-forest to-heritage-forest/70 flex items-center justify-center mb-4 shadow-lg">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">⚡ Lightning Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant loading and smooth navigation. Launch from your home screen like a native app
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-heritage-gold to-heritage-gold/70 flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">🎯 Premium Experience</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Full-screen immersive interface optimized for your device. Feels like a real app!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
