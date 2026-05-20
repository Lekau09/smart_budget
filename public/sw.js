/* public/sw.js — Smart Budget Service Worker */

// ── Push notification received ─────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Smart Budget', body: event.data ? event.data.text() : 'New notification' };
  }

  const title   = data.title || 'Smart Budget';
  const options = {
    body:    data.body  || 'You have a new transaction',
    icon:    data.icon  || '/vite.svg',
    badge:   '/vite.svg',
    vibrate: [200, 100, 200],
    tag:     'smart-budget-transaction',   // replaces previous notification
    renotify: true,
    data: {
      url:        data.url  || '/transactions',
      sms_raw_id: data.data?.sms_raw_id,
      category:   data.data?.category,
      amount:     data.data?.amount,
      store:      data.data?.store,
    },
    actions: [
      { action: 'view',    title: '👁 View Transaction' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification clicked ───────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/transactions';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url });
          return;
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Install / activate (cache nothing — we're push-only) ──────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
