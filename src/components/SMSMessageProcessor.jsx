import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Mail, CheckCircle, AlertCircle, Wifi, WifiOff, Zap } from 'lucide-react';
import { API_BASE, parseSMS, parseSMSBulk, checkMLHealth, confirmSMSCategory } from '../config/api';
import SMSTransactionModal from './SMSTransactionModal';
import { useNotification } from '../context/NotificationContext';

const CATEGORY_ICONS = {
  Food: '🍔', Groceries: '🛒', Transport: '🚗',
  Entertainment: '🎬', Health: '💊', Utilities: '💡',
  Shopping: '🛍️', Education: '📚', Other: '📦'
};

// ── Auto-save toast notification ─────────────────────────────────────────────
function AutoSaveToast({ data, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 350);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const cat = data.category || 'Other';
  const icon = CATEGORY_ICONS[cat] || '📦';

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: '#fff',
      border: '1px solid #D1FAE5',
      borderLeft: '4px solid #10B981',
      borderRadius: 12,
      padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      minWidth: 280,
      maxWidth: 340,
      transition: 'opacity 0.35s, transform 0.35s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>
          Transaction auto-saved!
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          background: '#F0FDF4',
          color: '#166534',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {icon} {cat}
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#EF4444' }}>
          -M{parseFloat(data.amount).toFixed(2)}
        </span>
      </div>
      {data.store && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6B7280' }}>
          {data.store}
        </p>
      )}
      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#10B981' }}>
        Budget updated automatically
      </p>
    </div>
  );
}

// ── Confidence threshold for auto-save (90%) ──────────────────────────────────
const AUTO_SAVE_THRESHOLD = 0.90;

export default function SMSMessageProcessor({ userId, onTransactionAdded }) {
  const [messages, setMessages]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [extraction, setExtraction]         = useState(null);
  const [showModal, setShowModal]           = useState(false);
  const [error, setError]                   = useState('');
  const [mlPredictions, setMlPredictions]   = useState({});
  const [mlHealthy, setMlHealthy]           = useState(null);
  const [autoSaving, setAutoSaving]         = useState({});   // { [msgId]: true }
  const [toasts, setToasts]                 = useState([]);   // [{ id, data }]

  // Manual category picker
  const [showCategoryPicker, setShowCategoryPicker]   = useState(false);
  const [pendingTransaction, setPendingTransaction]   = useState(null);

  const { addNotification } = useNotification();
  const previousMessageCountRef = useRef(0);

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    checkMLHealth().then(healthy => {
      setMlHealthy(healthy);
      if (!healthy) {
        addNotification('⚠️ ML API offline — start backend/app.py', 'warning', true);
      }
    });
    if (userId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // ── Fetch pending SMS ─────────────────────────────────────────────────────
  const fetchMessages = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE}/get-sms-messages.php?user_id=${userId}&limit=5`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        setError(`API Error: ${response.status} ${response.statusText}`);
        setMessages([]);
        return;
      }

      const data = await response.json();

      if (data.success && data.messages?.length > 0) {
        // Run ML batch on all messages
        let predictions = {};
        if (mlHealthy) {
          try {
            const texts   = data.messages.map(m => m.sms_text);
            const mlBatch = await parseSMSBulk(texts);
            if (mlBatch.results) {
              mlBatch.results.forEach((result, idx) => {
                predictions[data.messages[idx].id] = result;
              });
              setMlPredictions(predictions);
            }
          } catch (mlErr) {
            console.error('ML batch error:', mlErr);
            setMlHealthy(false);
          }
        }

        // Auto-save high-confidence transactions
        for (const msg of data.messages) {
          const ml = predictions[msg.id];
          if (
            ml &&
            !ml.needs_manual_category &&
            ml.confidence >= AUTO_SAVE_THRESHOLD &&
            ml.amount > 0
          ) {
            autoSaveTransaction(msg, ml);
          }
        }

        // Notify on new messages
        const prev = previousMessageCountRef.current;
        if (data.messages.length > prev && prev > 0) {
          const n = data.messages.length - prev;
          addNotification(
            n === 1
              ? `📱 New SMS from ${data.messages[0].sms_from}`
              : `📱 ${n} new SMS messages`,
            'info', false
          );
        }
        previousMessageCountRef.current = data.messages.length;
        setMessages(data.messages);
      } else {
        previousMessageCountRef.current = 0;
        setMessages([]);
        setMlPredictions({});
      }
    } catch (err) {
      setError('Network Error: ' + err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-save high-confidence transaction ─────────────────────────────────
  const autoSaveTransaction = async (message, ml) => {
    // Prevent double-saving the same message
    setAutoSaving(prev => {
      if (prev[message.id]) return prev;
      return { ...prev, [message.id]: true };
    });

    // Small delay so UI renders first
    await new Promise(r => setTimeout(r, 400));

    try {
      const isIncome = ml.transaction_type?.toLowerCase() === 'income';

      const response = await fetch(`${API_BASE}/save-sms-transaction.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:     userId,
          sms_raw_id:  message.id,
          amount:      parseFloat(ml.amount),
          category:    ml.category || 'Other',
          description: ml.store || ml.transaction_type || 'SMS transaction',
          type:        isIncome ? 'income' : 'expense',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show toast
        setToasts(prev => [...prev, {
          id:   message.id,
          data: {
            amount:   ml.amount,
            category: ml.category,
            store:    ml.store,
          },
        }]);

        // Remove from list
        setMessages(prev => prev.filter(m => m.id !== message.id));
        if (onTransactionAdded) onTransactionAdded(data.transaction_id);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Leave message in list so user can process manually
    } finally {
      setAutoSaving(prev => {
        const next = { ...prev };
        delete next[message.id];
        return next;
      });
    }
  };

  // ── User clicks an SMS card ───────────────────────────────────────────────
  const handleMessageClick = async (message) => {
    // Don't allow clicking while auto-saving
    if (autoSaving[message.id]) return;

    setSelectedMessage(message);
    setLoading(true);
    setError('');

    try {
      let mlResult = mlPredictions[message.id];
      if (!mlResult && mlHealthy) {
        mlResult = await parseSMS(message.sms_text);
      }

      if (mlResult) {
        const ext = {
          bank:                  mlResult.bank       || 'Unknown Bank',
          amount:                mlResult.amount      || 0,
          store:                 mlResult.store       || 'Unknown Merchant',
          balance:               mlResult.balance     || null,
          category:              mlResult.category    || null,
          confidence:            mlResult.confidence,
          needs_manual_category: mlResult.needs_manual_category,
          top_predictions:       mlResult.top_predictions || [],
          transaction_type:      mlResult.transaction_type || 'Purchase',
          raw_sms:               message.sms_text,
        };

        if (mlResult.needs_manual_category) {
          setPendingTransaction({ message, extraction: ext });
          setShowCategoryPicker(true);
          setLoading(false);
          return;
        }

        setExtraction(ext);
        setShowModal(true);
        return;
      }

      // Fallback: PHP extraction
      const response = await fetch(`${API_BASE}/extract-sms-transaction.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, sms_raw_id: message.id }),
      });
      const data = await response.json();
      if (data.success) {
        setExtraction(data.extraction);
        setShowModal(true);
      } else {
        setError(data.error || 'Failed to extract transaction');
      }
    } catch (err) {
      setError('Error processing transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Manual category pick ──────────────────────────────────────────────────
  const handleManualCategorySelect = async (category) => {
    if (!pendingTransaction) return;
    setShowCategoryPicker(false);

    try {
      const confirmed = await confirmSMSCategory(
        pendingTransaction.message.sms_text,
        category,
        pendingTransaction.extraction.store
      );
      setExtraction({
        ...pendingTransaction.extraction,
        category,
        confidence:            1.0,
        needs_manual_category: false,
        manually_confirmed:    true,
        ...confirmed,
      });
    } catch {
      setExtraction({
        ...pendingTransaction.extraction,
        category,
        manually_confirmed: true,
      });
    }

    setSelectedMessage(pendingTransaction.message);
    setShowModal(true);
    setPendingTransaction(null);
  };

  // ── Transaction saved via modal ───────────────────────────────────────────
  const handleTransactionSaved = (transactionId) => {
    setMessages(prev => prev.filter(m => m.id !== selectedMessage?.id));
    addNotification('✅ Transaction saved!', 'success', true);
    if (onTransactionAdded) onTransactionAdded(transactionId);
    setShowModal(false);
    setSelectedMessage(null);
    setExtraction(null);
  };

  // ── MANUAL CATEGORY PICKER ────────────────────────────────────────────────
  if (showCategoryPicker && pendingTransaction) {
    const hint = pendingTransaction.extraction.top_predictions?.[0]?.category;
    return (
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1F2937' }}>
          Select Category
        </h3>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6B7280' }}>
          Store: <strong>{pendingTransaction.extraction.store || 'Unknown'}</strong>
        </p>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pendingTransaction.message.sms_text}
        </p>
        {hint && (
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280' }}>
            💡 Suggested: <strong style={{ color: '#3B82F6' }}>{hint}</strong>
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
            <button
              key={cat}
              onClick={() => handleManualCategorySelect(cat)}
              style={{
                padding: '14px 8px',
                border: cat === hint ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                borderRadius: 10,
                background: cat === hint ? '#EFF6FF' : 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600,
                color: cat === hint ? '#1D4ED8' : '#374151',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowCategoryPicker(false); setPendingTransaction(null); }}
          style={{
            width: '100%', padding: 10, background: 'none',
            border: '1px solid #E5E7EB', borderRadius: 8,
            cursor: 'pointer', fontSize: 14, color: '#6B7280',
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── EMPTY STATE ───────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <>
        {toasts.map(t => (
          <AutoSaveToast
            key={t.id}
            data={t.data}
            onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        ))}
        <div style={{
          background: '#F9FAFB', border: '1px solid #E5E7EB',
          borderRadius: 8, padding: 20, textAlign: 'center',
        }}>
          <Mail size={32} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280', marginBottom: 8 }}>
            {userId ? 'No new SMS messages to process' : 'Not logged in'}
          </p>
          <div style={{ marginBottom: 12 }}>
            {mlHealthy === true  && <span style={{ fontSize: 12, color: '#16A34A' }}><Wifi size={12} style={{ display: 'inline', marginRight: 4 }} />ML API connected</span>}
            {mlHealthy === false && <span style={{ fontSize: 12, color: '#DC2626' }}><WifiOff size={12} style={{ display: 'inline', marginRight: 4 }} />ML API offline — run backend/app.py</span>}
          </div>
          {error && <p style={{ color: '#DC2626', marginBottom: 12, fontSize: 12 }}>{error}</p>}
          <button
            onClick={fetchMessages}
            disabled={loading || !userId}
            style={{
              padding: '8px 16px', background: userId ? '#3B82F6' : '#D1D5DB',
              color: 'white', border: 'none', borderRadius: 6,
              cursor: userId ? 'pointer' : 'not-allowed', fontSize: 14,
              fontWeight: 600, display: 'flex', alignItems: 'center',
              gap: 8, margin: '0 auto', opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </>
    );
  }

  // ── MESSAGES LIST ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Auto-save toasts */}
      {toasts.map(t => (
        <AutoSaveToast
          key={t.id}
          data={t.data}
          onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
        />
      ))}

      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2937' }}>
              New SMS Messages ({messages.length})
            </h3>
            {mlHealthy === true  && (
              <span style={{ fontSize: 11, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 999 }}>
                🤖 ML Active
              </span>
            )}
            {mlHealthy === false && (
              <span style={{ fontSize: 11, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: 999 }}>
                ML Offline
              </span>
            )}
          </div>
          <button
            onClick={fetchMessages} disabled={loading}
            style={{ padding: '6px 12px', background: 'none', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>

        {/* Auto-save info banner */}
        {mlHealthy && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 8, padding: '8px 14px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#166534',
          }}>
            <Zap size={14} color="#10B981" style={{ flexShrink: 0 }} />
            Transactions above 90% confidence are saved automatically. Others require your confirmation.
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8,
            padding: 12, marginBottom: 16, display: 'flex', gap: 12,
            color: '#DC2626', fontSize: 14,
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* SMS cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg) => {
            const ml      = mlPredictions[msg.id];
            const saving  = autoSaving[msg.id];
            const isAuto  = ml && !ml.needs_manual_category && ml.confidence >= AUTO_SAVE_THRESHOLD && ml.amount > 0;

            return (
              <div
                key={msg.id}
                onClick={() => !saving && handleMessageClick(msg)}
                style={{
                  background: saving ? '#F0FDF4' : 'white',
                  border: `1px solid ${saving ? '#10B981' : '#E5E7EB'}`,
                  borderRadius: 8, padding: 12,
                  cursor: saving ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: saving ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6B7280' }}>
                      From: {msg.sms_from}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: 14, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.sms_text}
                    </p>

                    {/* ML badges */}
                    {ml && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {ml.bank && (
                          <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                            🏦 {ml.bank}
                          </span>
                        )}
                        {ml.amount > 0 && (
                          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                            💰 M{ml.amount}
                          </span>
                        )}
                        {ml.category ? (
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                            {CATEGORY_ICONS[ml.category] || '📂'} {ml.category}
                          </span>
                        ) : (
                          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                            ⚠️ Needs category
                          </span>
                        )}
                        {ml.confidence && (
                          <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                            {Math.round(ml.confidence * 100)}% sure
                          </span>
                        )}
                        {isAuto && (
                          <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            ⚡ Auto-saving...
                          </span>
                        )}
                      </div>
                    )}

                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                      {new Date(msg.received_stamp).toLocaleString()}
                    </p>
                  </div>

                  {saving
                    ? <RefreshCw size={18} color="#10B981" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                    : <CheckCircle size={20} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {selectedMessage && (
          <SMSTransactionModal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setSelectedMessage(null); setExtraction(null); }}
            smsMessage={selectedMessage}
            extraction={extraction}
            onTransactionSaved={handleTransactionSaved}
            userId={userId}
          />
        )}
      </div>
    </>
  );
}