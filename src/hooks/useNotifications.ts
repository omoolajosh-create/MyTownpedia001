import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not supported',
        description: 'Push notifications are not supported in this browser',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive notifications for new comments, story approvals, and achievements',
        });
        return true;
      } else {
        toast({
          title: 'Permission denied',
          description: 'You can enable notifications later in your browser settings',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permission',
        variant: 'destructive',
      });
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        await savePushSubscription(existingSubscription);
        return;
      }

      // Subscribe to push notifications (without VAPID key for now)
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
      });

      setSubscription(newSubscription);
      await savePushSubscription(newSubscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Subscription failed',
        description: 'Failed to subscribe to push notifications',
        variant: 'destructive',
      });
    }
  };

  const savePushSubscription = async (subscription: PushSubscription) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subscription.toJSON() as any,
          endpoint: subscription.endpoint,
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !user) return;

    try {
      await subscription.unsubscribe();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSubscription(null);
      toast({
        title: 'Unsubscribed',
        description: 'You will no longer receive push notifications',
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from notifications',
        variant: 'destructive',
      });
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
