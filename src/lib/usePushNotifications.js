// src/lib/usePushNotifications.js
import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from './firebase';
import { supabase } from './supabaseClient';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function usePushNotifications(userId) {
  const tokenSaved = useRef(false);

  useEffect(() => {
    if (!userId || tokenSaved.current) return;

    async function setupPush() {
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }

        // Register service worker for FCM
        const swReg = await navigator.serviceWorker.register('/firebase-sw.js');

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!token) return;

        // Save token to Supabase
        await supabase.from('push_tokens').upsert({
          user_id: userId,
          token,
          platform: 'web',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        tokenSaved.current = true;
        console.log('Push token saved:', token.substring(0, 20) + '...');

        // Handle foreground messages (app is open)
        onMessage(messaging, (payload) => {
          console.log('Foreground push received:', payload);
          const { title, body } = payload.notification || {};
          if (title && Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-72.png',
              data: payload.data,
            });
          }
        });

      } catch (err) {
        console.warn('Push setup error:', err.message);
      }
    }

    setupPush();
  }, [userId]);
}