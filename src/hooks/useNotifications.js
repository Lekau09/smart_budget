// src/hooks/useNotifications.js
// Fetches notifications from PHP backend for the bell icon.
// NO popup toasts — all notifications go to the bell only.
// Cash withdrawals needing categorization appear in the
// Transactions page under "Uncategorized Cash Withdrawals".

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res  = await fetch(`${API_BASE}/notifications.php?user_id=${userId}&limit=50`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.notifications) return;

      // Parse notifications — strip smsData JSON to plain message for display
      const mapped = data.notifications.map(n => {
        let displayMessage = n.message;
        try {
          const parsed = JSON.parse(n.message);
          if (parsed && parsed.text) displayMessage = parsed.text;
        } catch (_) {}
        return { ...n, message: displayMessage };
      });

      setNotifications(mapped);
      setUnreadCount(data.unread_count ?? 0);
      // No toasts — notifications go to bell only
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_BASE}/notification-read.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ notification_id: notificationId, user_id: userId }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) { console.error('markAsRead:', err); }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/notification-read.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mark_all: true, user_id: userId }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error('markAllAsRead:', err); }
  }, [userId]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}