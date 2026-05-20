// src/components/PushNotificationSettings.jsx
// Drop this card into your existing Settings page

import React from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationSettings({ userId }) {
  const {
    supported, permission, isEnabled,
    loading, error,
    enableNotifications, disableNotifications,
  } = usePushNotifications(userId);

  if (!supported) {
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <BellOff size={20} style={{ color: '#9CA3AF' }} />
          <span style={styles.title}>Push Notifications</span>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>
          Your browser does not support push notifications.
          Try Chrome or Edge on desktop/Android.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <Bell size={20} style={{ color: isEnabled ? '#10B981' : '#6B7280' }} />
        <span style={styles.title}>Push Notifications</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 12, fontWeight: 600,
          padding: '3px 10px', borderRadius: 999,
          background: isEnabled ? '#DCFCE7' : '#F3F4F6',
          color:      isEnabled ? '#166534' : '#6B7280',
        }}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Description */}
      <p style={{ color: '#6B7280', fontSize: 13, margin: '0 0 16px' }}>
        Get instant browser alerts when your bank card is swiped — even
        when the app tab is minimised.
      </p>

      {/* Example notification preview */}
      {!isEnabled && (
        <div style={styles.preview}>
          <div style={{ fontSize: 18, marginRight: 10 }}>🛒</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>
              New Transaction — Groceries
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              M231.27 spent at USave Roma | Balance: M981.50
            </div>
          </div>
        </div>
      )}

      {/* What you'll receive list */}
      <div style={{ marginBottom: 16 }}>
        {[
          'Instant alert on every card swipe',
          'Category auto-detected by ML',
          'Remaining balance shown',
          'Tap to open transaction directly',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Permission denied warning */}
      {permission === 'denied' && (
        <div style={styles.warning}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            Notifications blocked. Click the lock icon in your browser
            address bar → Notifications → Allow, then reload.
          </span>
        </div>
      )}

      {/* Action button */}
      {permission !== 'denied' && (
        <button
          onClick={isEnabled ? disableNotifications : enableNotifications}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: loading  ? '#D1D5DB'
                      : isEnabled ? '#FEE2E2'
                      : '#10B981',
            color:  loading ? '#9CA3AF' : isEnabled ? '#DC2626' : 'white',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>⏳ {isEnabled ? 'Disabling...' : 'Enabling...'}</>
          ) : isEnabled ? (
            <><BellOff size={18} /> Disable Notifications</>
          ) : (
            <><Bell size={18} /> Enable Push Notifications</>
          )}
        </button>
      )}

      {isEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'center' }}>
          <Wifi size={13} style={{ color: '#10B981' }} />
          <span style={{ fontSize: 12, color: '#10B981' }}>
            Receiving alerts for all card transactions
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'white', borderRadius: 14,
    border: '1px solid #E5E7EB', padding: 20,
    marginBottom: 16,
  },
  header: {
    display: 'flex', alignItems: 'center',
    gap: 10, marginBottom: 12,
  },
  title: {
    fontSize: 16, fontWeight: 700, color: '#1F2937',
  },
  preview: {
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    borderRadius: 10, padding: '10px 14px',
    display: 'flex', alignItems: 'center',
    marginBottom: 16,
  },
  error: {
    background: '#FEE2E2', border: '1px solid #FCA5A5',
    borderRadius: 8, padding: '10px 12px',
    display: 'flex', gap: 8,
    color: '#DC2626', fontSize: 13, marginBottom: 12,
  },
  warning: {
    background: '#FEF3C7', border: '1px solid #FCD34D',
    borderRadius: 8, padding: '10px 12px',
    display: 'flex', gap: 8,
    color: '#92400E', fontSize: 13, marginBottom: 12,
  },
};
