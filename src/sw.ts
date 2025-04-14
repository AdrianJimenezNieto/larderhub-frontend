/// <reference lib="WebWorker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() as { title?: string; body?: string } | undefined;
  const title = data?.title ?? 'LarderHub';
  const body = data?.body ?? 'Tienes productos por caducar.';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    (self.clients as Clients).openWindow('/dashboard')
  );
});
