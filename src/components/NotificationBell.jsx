import React, { useContext, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, dismissNotification } = useContext(NotificationContext) || {
    notifications: [],
    unreadCount: 0,
    markAllAsRead: () => {},
    dismissNotification: () => {}
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: '#D1FAE5',
          border: '#10B981',
          text: '#065F46',
          icon: '✓'
        };
      case 'error':
        return {
          bg: '#FEE2E2',
          border: '#DC2626',
          text: '#7F1D1D',
          icon: '✕'
        };
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: '#F59E0B',
          text: '#78350F',
          icon: '⚠'
        };
      case 'info':
      default:
        return {
          bg: '#CFFAFE',
          border: '#0891B2',
          text: '#164E63',
          icon: 'ℹ'
        };
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        title="Notifications"
      >
        <Bell size={20} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700',
              border: '2px solid var(--surface)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '0.5rem',
            width: '360px',
            backgroundColor: 'var(--surface)',
            borderRadius: '0.875rem',
            boxShadow: '0 20px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 9999,
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInDown 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}
            >
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '400px'
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1.25rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => {
                const styles = getNotificationStyles(notif.type);
                return (
                  <div
                    key={notif.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: notif.read ? 'var(--surface)' : 'rgba(10, 92, 224, 0.02)',
                      display: 'flex',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!notif.read) {
                        e.currentTarget.style.backgroundColor = 'rgba(10, 92, 224, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!notif.read) {
                        e.currentTarget.style.backgroundColor = 'rgba(10, 92, 224, 0.02)';
                      }
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: styles.bg,
                        borderLeft: `3px solid ${styles.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: styles.text,
                        fontWeight: '600'
                      }}
                    >
                      {styles.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--text-primary)',
                          fontWeight: notif.read ? '400' : '600',
                          wordWrap: 'break-word'
                        }}
                      >
                        {notif.message}
                      </p>
                      <p
                        style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notif.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        opacity: 0.6,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function formatTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
