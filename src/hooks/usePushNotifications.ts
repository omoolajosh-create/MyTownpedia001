import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const VAPID_PUBLIC_KEY = 'BI8wvCsHWVBJb6ZrZBaEIZ-GMwhGk4HCtjDYqiqZwbOuikdsXSoT7rRrpwdxNTnXbrg8VQ25W0ahRpIdzA8TqNg'

const decodeKey = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

export function usePushNotifications(userId?: string, isAdmin = false) {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setSupported(Boolean(userId && isAdmin && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window))
  }, [userId, isAdmin])

  useEffect(() => {
    if (!supported || !userId) return
    navigator.serviceWorker.ready.then(async registration => {
      const subscription = await registration.pushManager.getSubscription()
      setEnabled(Boolean(subscription))
    }).catch(() => setEnabled(false))
  }, [supported, userId])

  const enable = useCallback(async () => {
    if (!supported || !userId) throw new Error('Push notifications are not supported on this device')
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') throw new Error('Notification permission was not granted')
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(VAPID_PUBLIC_KEY) })
      const json = subscription.toJSON()
      const { error } = await (supabase as any).from('admin_push_subscriptions').upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        user_agent: navigator.userAgent,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' })
      if (error) throw error
      setEnabled(true)
    } finally {
      setBusy(false)
    }
  }, [supported, userId])

  const disable = useCallback(async () => {
    if (!userId || !('serviceWorker' in navigator)) return
    setBusy(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await (supabase as any).from('admin_push_subscriptions').delete().eq('endpoint', subscription.endpoint).eq('user_id', userId)
        await subscription.unsubscribe()
      }
      setEnabled(false)
    } finally {
      setBusy(false)
    }
  }, [userId])

  return { supported, enabled, busy, enable, disable }
}
