// public/firebase-sw.js
// Firebase Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBPzLwPmAA9UrPQoRbudj6MJ9Au3ggKd7U",
  authDomain: "campusplug-4d7a3.firebaseapp.com",
  projectId: "campusplug-4d7a3",
  storageBucket: "campusplug-4d7a3.firebasestorage.app",
  messagingSenderId: "143401752102",
  appId: "1:143401752102:web:0db44bcc74fa79fdd378e7",
});

const messaging = firebase.messaging();

// Handle background messages (app is closed/hidden)
messaging.onBackgroundMessage((payload) => {
  console.log('Background push received:', payload);

  const { title, body, image } = payload.notification || {};
  const notificationOptions = {
    body: body || '',
    icon: image || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(title || 'CampusPlug', notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});