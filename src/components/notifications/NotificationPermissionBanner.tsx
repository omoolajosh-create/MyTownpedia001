import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export const NotificationPermissionBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { permission, requestPermission } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsDismissed(true);
    }
  };

  if (!user || isDismissed || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-md p-4 shadow-lg animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Enable Notifications</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get notified about new comments, story approvals, and achievements
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Enable
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};
