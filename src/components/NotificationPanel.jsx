import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { API_BASE, confirmSMSCategory } from '../config/api';

// Category picker — shown when user clicks a "Review needed" toast
const CATEGORIES = [
  { name: 'Food',          icon: '🍴' },
  { name: 'Groceries',     icon: '🛒' },
  { name: 'Transport',     icon: '🚌' },
  { name: 'Entertainment', icon: '🎭' },
  { name: 'Health',        icon: '💊' },
  { name: 'Utilities',     icon: '⚡' },
  { name: 'Shopping',      icon: '🛍️' },
  { name: 'Other',         icon: '❓' },
];

function CategoryPicker({ notification, onSelect, onCancel }) {
  const sms = notification.smsData || {};
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        padding: 24, maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideInUp 250ms ease',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#1F2937' }}>
            Select Category
          </h3>
          {sms.store && (
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6B7280' }}>
              Store: <strong style={{ color: '#374151' }}>{sms.store}</strong>
            </p>
          )}
          {sms.amount && (
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              Amount: <strong style={{ color: '#DC2626' }}>M{sms.amount}</strong>
            </p>
          )}
        </div>

        {/* Raw SMS preview */}
        {sms.raw_sms && (
          <div style={{
            background: '#F3F4F6', borderRadius: 8,
            padding: '8px 12px', marginBottom: 16,
            fontSize: 12, color: '#6B7280',
            fontStyle: 'italic',
            maxHeight: 60, overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            "{sms.raw_sms}"
          </div>
        )}

        {/* Category grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8, marginBottom: 16,
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name, notification)}
              style={{
                padding: '10px 4px',
                border: '1px solid #E5E7EB',
                borderRadius: 10, background: 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 600, color: '#374151',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.background  = '#EFF6FF';
                e.currentTarget.style.color       = '#1D4ED8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.background  = 'white';
                e.currentTarget.style.color       = '#374151';
              }}
            >
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: 10,
            background: 'none', border: '1px solid #E5E7EB',
            borderRadius: 8, cursor: 'pointer',
            fontSize: 14, color: '#6B7280',
          }}
        >
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main NotificationPanel ────────────────────────────────────
export default function NotificationPanel() {
  const { notifications, dismissNotification } = React.useContext(NotificationContext)
    || { notifications: [], dismissNotification: () => {} };

  const [removingIds, setRemovingIds]   = useState(new Set());
  const [pickerNotif, setPickerNotif]   = useState(null); // notification being categorized
  const [saving, setSaving]             = useState(false);

  const getStyles = (type) => {
    switch (type) {
      case 'success': return {
        bg: 'linear-gradient(135deg,#f0fdf4,#f5fdf7)',
        border: '#86efac', icon: CheckCircle, color: '#166534',
      };
      case 'error': return {
        bg: 'linear-gradient(135deg,#fef2f2,#fef7f7)',
        border: '#fca5a5', icon: AlertCircle, color: '#991b1b',
      };
      case 'warning': return {
        bg: 'linear-gradient(135deg,#fffbeb,#fdfbe9)',
        border: '#fcd34d', icon: AlertCircle, color: '#92400e',
      };
      default: return {
        bg: 'linear-gradient(135deg,#f0f9ff,#f5fafb)',
        border: '#7dd3fc', icon: Info, color: '#0c2d48',
      };
    }
  };

  const handleDismiss = (id) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      dismissNotification(id);
      setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 300);
  };

  // User clicked a "Review needed" toast → open category picker
  const handleToastClick = (notification) => {
    if (notification.smsData) {
      setPickerNotif(notification);
    } else if (notification.onAction) {
      notification.onAction();
      handleDismiss(notification.id);
    }
  };

  // User selected a category in the picker
  const handleCategorySelect = async (category, notification) => {
    setSaving(true);
    try {
      const sms = notification.smsData;

      // 1. Confirm category with ML API
      if (sms?.raw_sms) {
        await confirmSMSCategory(sms.raw_sms, category, sms.store || '');
      }

      // 2. Update the expense category in PHP backend
      if (sms?.expense_id) {
        await fetch(`${API_BASE}/update-expense.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expense_id: sms.expense_id,
            category,
            user_id: sms.user_id,
          }),
        });
      }

      // 3. Dismiss the toast
      handleDismiss(notification.id);
      setPickerNotif(null);

      // 4. Reload page to show updated category
      setTimeout(() => window.location.reload(), 300);

    } catch (err) {
      console.error('Category save error:', err);
      // Still dismiss even on error
      handleDismiss(notification.id);
      setPickerNotif(null);
    } finally {
      setSaving(false);
    }
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <>
      {/* Category picker overlay */}
      {pickerNotif && (
        <CategoryPicker
          notification={pickerNotif}
          onSelect={handleCategorySelect}
          onCancel={() => setPickerNotif(null)}
        />
      )}

      {/* Toast stack */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9999, maxWidth: 360,
        display: 'flex', flexDirection: 'column-reverse', gap: '0.75rem',
        pointerEvents: 'none',
      }}>
        {notifications.slice(0, 2).map((notification) => {
          const styles    = getStyles(notification.type);
          const Icon      = styles.icon;
          const isRemoving = removingIds.has(notification.id);
          const isClickable = !!(notification.smsData || notification.onAction);

          return (
            <div
              key={notification.id}
              onClick={() => isClickable && handleToastClick(notification)}
              style={{
                background:   styles.bg,
                border:       `1px solid ${styles.border}`,
                borderRadius: '0.625rem',
                padding:      '0.875rem 1rem',
                color:        styles.color,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                gap:          '0.75rem',
                fontSize:     '0.875rem',
                fontWeight:   500,
                boxShadow:    '0 2px 8px rgba(0,0,0,0.08)',
                animation:    isRemoving
                  ? 'toastFadeOut 0.3s ease-out forwards'
                  : 'toastSlideUp 0.3s ease-out',
                pointerEvents: 'auto',
                cursor:       isClickable ? 'pointer' : 'default',
                transition:   'all 0.2s',
                // Highlight clickable toasts
                outline:      isClickable ? `1px solid ${styles.border}` : 'none',
              }}
              onMouseEnter={e => {
                if (isClickable) e.currentTarget.style.filter = 'brightness(0.97)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '0.625rem', minWidth: 0, flex: 1,
              }}>
                <Icon size={18} style={{ flexShrink: 0, opacity: 0.8 }} />
                <div style={{ minWidth: 0 }}>
                  <span style={{
                    display: 'block',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {notification.message}
                  </span>
                  {isClickable && (
                    <span style={{
                      fontSize: '0.75rem', opacity: 0.75,
                      display: 'block', marginTop: 2,
                    }}>
                      {notification.actionLabel || 'Tap to select category →'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(notification.id); }}
                style={{
                  background: 'none', border: 'none',
                  color: 'inherit', cursor: 'pointer',
                  padding: '0.25rem', display: 'flex',
                  alignItems: 'center', opacity: 0.6,
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(5px); }
        }
      `}</style>
    </>
  );
}