/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<unknown> }

clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = event.data?.json?.() || {}
  const title = data.title || 'MyTownpedia update'
  const options: NotificationOptions = {
    body: data.body || 'New content is waiting for your review.',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    tag: data.tag || 'mytownpedia-update',
    data: { url: data.url || '/admin/content-approval' },
    requireInteraction: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/admin/content-approval', self.location.origin).href
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ('focus' in client) { client.navigate(target); return client.focus() }
    }
    return self.clients.openWindow(target)
  }))
})
