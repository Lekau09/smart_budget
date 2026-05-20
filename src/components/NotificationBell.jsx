import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, TrendingUp, AlertCircle, ShoppingBag, Info } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open,          setOpen]          = useState(false);
  const [markingAll,    setMarkingAll]     = useState(false);
  const dropdownRef = useRef(null);
  const pollRef     = useRef(null);

  const unreadCount = notifications.filter(n => !Number(n.is_read)).length;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res  = await fetch(`${API_BASE}/get-notifications.php?user_id=${userId}&limit=30`);
      if (!res.ok) return;
      const data = await res.json();
      // handle both { success, notifications } and plain array
      const items = Array.isArray(data)
        ? data
        : (data.notifications || data.data || []);
      setNotifications(items);
    } catch (e) {
      console.warn('NotificationBell fetch failed:', e);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 5000);
    return () => clearInterval(pollRef.current);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    try {
      await fetch(`${API_BASE}/mark-notification-read.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: userId, notification_id: id }),
      });
    } catch {}
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    try {
      await fetch(`${API_BASE}/mark-notification-read.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: userId, mark_all: true }),
      });
    } catch {
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type, title) => {
    const t = (type || '').toLowerCase();
    const ti = (title || '').toLowerCase();
    const s = { flexShrink: 0, marginTop: 1 };
    if (t === 'withdrawal' || ti.includes('withdrawal')) return <AlertCircle size={15} style={{ ...s, color: '#D97706' }} />;
    if (t === 'warning'    || ti.includes('exceed'))      return <AlertCircle size={15} style={{ ...s, color: '#EF4444' }} />;
    if (ti.includes('shopping') || ti.includes('groceries')) return <ShoppingBag size={15} style={{ ...s, color: '#EC4899' }} />;
    if (ti.includes('info'))    return <Info size={15} style={{ ...s, color: '#3B82F6' }} />;
    return <TrendingUp size={15} style={{ ...s, color: 'var(--primary-main)' }} />;
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>

      {/* Bell button */}
      <button onClick={() => setOpen(v => !v)} style={{
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', padding: 7, display: 'flex', alignItems: 'center',
        color: 'var(--text-secondary)', borderRadius: 8, transition: 'color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <Bell size={21} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 1, right: 1,
            background: '#EF4444', color: 'white',
            fontSize: 10, fontWeight: 700, lineHeight: 1,
            borderRadius: 99, minWidth: 17, height: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '1.5px solid var(--bg-primary)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16, width: 360, zIndex: 9999,
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: 'bellIn 160ms ease',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', borderBottom: '1px solid var(--border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#EF4444', color: 'white',
                  fontSize: 11, fontWeight: 700,
                  borderRadius: 99, padding: '2px 8px',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            <button onClick={markAllRead}
              disabled={unreadCount === 0 || markingAll}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none',
                cursor: unreadCount === 0 ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 500,
                color: unreadCount === 0 ? 'var(--text-muted)' : 'var(--primary-main)',
                opacity: unreadCount === 0 ? 0.45 : 1,
                padding: '5px 8px', borderRadius: 7, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (unreadCount > 0) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <CheckCheck size={14} />
              {markingAll ? 'Marking...' : 'Mark all read'}
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <Bell size={32} style={{
                  color: 'var(--text-muted)', display: 'block',
                  margin: '0 auto 10px', opacity: 0.4,
                }} />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const isRead = Number(n.is_read) === 1;
                return (
                  <div key={n.id || i}
                    onClick={() => !isRead && markRead(n.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '13px 18px',
                      background: isRead ? 'transparent' : 'var(--bg-secondary)',
                      borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
                      cursor: isRead ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isRead) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isRead ? 'transparent' : 'var(--bg-secondary)'; }}>

                    {getIcon(n.type, n.title)}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: isRead ? 500 : 700,
                        color: 'var(--text-primary)', margin: '0 0 3px',
                      }}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p style={{
                          fontSize: 13, color: 'var(--text-secondary)',
                          margin: '0 0 4px', lineHeight: 1.45,
                        }}>
                          {n.body}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                        {timeAgo(n.created_at)}
                      </p>
                    </div>

                    {!isRead && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--primary-main)',
                        flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 18px', borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
            }}>
              <a href="/app/notifications" style={{
                fontSize: 14, color: 'var(--primary-main)',
                textDecoration: 'none', fontWeight: 500,
              }}>
                View All Notifications →
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bellIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}