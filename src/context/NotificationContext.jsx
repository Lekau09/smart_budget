import React, { createContext, useState, useCallback } from 'react';
export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  // ── Add notification ──────────────────────────────────────
  // Extra options: { actionLabel, onAction, persistent }
  const addNotification = useCallback((message, type = 'info', autoRemove = true, options = {}) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      read:        false,
      createdAt:   new Date(),
      // Clickable action support
      actionLabel: options.actionLabel || null,
      onAction:    options.onAction    || null,
      persistent:  options.persistent  || false,
      // Category picker support
      smsData:     options.smsData     || null,  // { raw_sms, amount, store, bank }
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    if (autoRemove && !options.persistent) {
      setTimeout(() => {
        setNotifications(prev => {
          const notif = prev.find(n => n.id === id);
          if (notif && !notif.read) setUnreadCount(c => Math.max(0, c - 1));
          return prev.filter(n => n.id !== id);
        });
      }, 1300);
    }
    return id;
  }, []);

  // ── Mark as read ──────────────────────────────────────────
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id && !n.read) {
          setUnreadCount(c => Math.max(0, c - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // ── Dismiss ───────────────────────────────────────────────
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => {
      const n = prev.find(n => n.id === id);
      if (n && !n.read) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const getPersistentNotifications = useCallback(() =>
    notifications.filter(n => n.type !== 'info' || !n.read),
  [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      addNotification, markAsRead, markAllAsRead,
      dismissNotification, clearAll, getPersistentNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}