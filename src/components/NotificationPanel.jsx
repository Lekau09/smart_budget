import React, { useContext } from 'react';
import { X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

export default function NotificationPanel() {
  const { notifications, dismissNotification } = useContext(NotificationContext) || { notifications: [], dismissNotification: () => {} };

  if (!notifications || notifications.length === 0) {
    return null;
  }

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
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {notifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              backgroundColor: styles.bg,
              borderLeft: `4px solid ${styles.border}`,
              borderRadius: '0.5rem',
              padding: '1rem',
              color: styles.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              animation: 'slideInDown 0.3s ease-out',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{styles.icon}</span>
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: styles.text,
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}

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
