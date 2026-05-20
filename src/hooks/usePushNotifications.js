// src/hooks/usePushNotifications.js
// Handles service worker registration + push subscription lifecycle

import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

// ── Your VAPID public key (must match WebPushSender.php) ──────
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(userId) {
  const [permission,    setPermission]    = useState(Notification.permission);
  const [subscription,  setSubscription]  = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [supported,     setSupported]     = useState(false);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (ok) checkExistingSubscription();
  }, [userId]);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) setSubscription(sub);
    } catch (e) {
      console.warn('Push check failed:', e);
    }
  };

  // ── Register SW + subscribe ────────────────────────────────
  const enableNotifications = async () => {
    if (!userId) { setError('Please log in first'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // 2. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Notification permission denied. Please allow in browser settings.');
        setLoading(false);
        return;
      }

      // 3. Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSubscription(sub);

      // 4. Save subscription to PHP backend
      const subJson = sub.toJSON();
      const res = await fetch(`${API_BASE}/save-push-subscription.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          user_id: userId,
          endpoint: subJson.endpoint,
          p256dh:   subJson.keys.p256dh,
          auth:     subJson.keys.auth,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save subscription');

      console.log('Push notifications enabled ✓');

    } catch (err) {
      console.error('Push enable error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Unsubscribe ────────────────────────────────────────────
  const disableNotifications = async () => {
    if (!subscription || !userId) return;
    setLoading(true);
    try {
      const subJson = subscription.toJSON();

      // Remove from browser
      await subscription.unsubscribe();
      setSubscription(null);
      setPermission('default');

      // Remove from database
      await fetch(`${API_BASE}/save-push-subscription.php`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          user_id: userId,
          p256dh:  subJson.keys.p256dh,
        }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    supported,
    permission,
    subscription,
    loading,
    error,
    isEnabled:          permission === 'granted' && !!subscription,
    enableNotifications,
    disableNotifications,
  };
}
