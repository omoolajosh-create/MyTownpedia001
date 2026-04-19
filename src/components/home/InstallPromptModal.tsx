import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Zap, Wifi, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstallPromptModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user has already seen the modal or installed the app
    const hasSeenModal = localStorage.getItem('install-modal-seen');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (hasSeenModal || isInstalled) return;

    // Show modal after 10 seconds on first visit
    const timer = setTimeout(() => {
      setShowModal(true);
      localStorage.setItem('install-modal-seen', 'true');
    }, 10000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowModal(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            Install MyTownpedia App
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get the best experience with our free app!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Lightning Fast</h4>
              <p className="text-sm text-muted-foreground">Instant loading and smooth navigation</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Works Offline</h4>
              <p className="text-sm text-muted-foreground">Access your favorite stories anytime, anywhere</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Home Screen Access</h4>
              <p className="text-sm text-muted-foreground">Quick launch from your home screen like a native app</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {deferredPrompt ? (
            <Button onClick={handleInstall} className="flex-1">
              Install Now - It's Free!
            </Button>
          ) : (
            <Button asChild className="flex-1">
              <Link to="/install">Learn How to Install</Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          No download from app store required • Takes less than 5 seconds
        </p>
      </DialogContent>
    </Dialog>
  );
};
