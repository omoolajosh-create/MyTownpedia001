import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Cookie Notice</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDecline}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            We use cookies to enhance your experience and analyze site usage.
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          <Button onClick={handleAccept} className="flex-1">
            Accept
          </Button>
          <Button onClick={handleDecline} variant="outline" className="flex-1">
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
