import React, { useState, useEffect } from 'react';
import { AlertCircle, X, CheckCircle, Loader } from 'lucide-react';
import { API_BASE } from '../config/api';

const CATEGORIES = [
  { label: 'Food',          emoji: '🍔', color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Groceries',     emoji: '🛒', color: '#10B981', bg: '#D1FAE5' },
  { label: 'Transport',     emoji: '🚗', color: '#3B82F6', bg: '#DBEAFE' },
  { label: 'Entertainment', emoji: '🎬', color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Shopping',      emoji: '🛍️', color: '#EC4899', bg: '#FCE7F3' },
  { label: 'Utilities',     emoji: '💡', color: '#F97316', bg: '#FFEDD5' },
  { label: 'Health',        emoji: '💊', color: '#EF4444', bg: '#FEE2E2' },
  { label: 'Education',     emoji: '📚', color: '#06B6D4', bg: '#CFFAFE' },
  { label: 'Other',         emoji: '📦', color: '#6B7280', bg: '#F3F4F6' },
];

export default function SMSTransactionModal({
  isOpen,
  onClose,
  smsMessage,
  extraction,
  onTransactionSaved,
  userId
}) {
  const [category, setCategory]     = useState('Other');
  const [description, setDescription] = useState('');
  const [amount, setAmount]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [savedData, setSavedData]   = useState(null);

  // Sync state whenever extraction or smsMessage changes
  useEffect(() => {
    if (!isOpen) return;
    setSuccess(false);
    setError('');
    setSavedData(null);

    // Amount: prefer ML extraction, fallback to smsMessage field
    const parsedAmount =
      parseFloat(extraction?.amount) ||
      parseFloat(smsMessage?.amount) ||
      0;
    setAmount(parsedAmount);

    // Category: map ML category to our list, fallback to Other
    const mlCat = extraction?.category || '';
    const matched = CATEGORIES.find(
      (c) => c.label.toLowerCase() === mlCat.toLowerCase()
    );
    setCategory(matched ? matched.label : 'Other');

    // Description: store name from ML, or empty
    setDescription(extraction?.store || '');
  }, [isOpen, extraction, smsMessage]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) === 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!userId) {
      setError('User not identified. Please log in again.');
      return;
    }
    if (!smsMessage?.id) {
      setError('SMS reference is missing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/save-sms-transaction.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:    userId,
          sms_raw_id: smsMessage.id,
          amount:     parseFloat(amount),
          category:   category,
          description: description,
          type:       extraction?.transaction_type?.toLowerCase() === 'income'
                        ? 'income'
                        : 'expense',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save transaction');
      }

      setSavedData(data);
      setSuccess(true);

      setTimeout(() => {
        onTransactionSaved && onTransactionSaved(data.transaction_id);
        onClose();
      }, 2200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !smsMessage) return null;

  const confidencePct = extraction?.confidence
    ? Math.round(extraction.confidence * 100)
    : null;
  const isHighConfidence = (confidencePct ?? 0) >= 80;
  const selectedCat = CATEGORIES.find((c) => c.label === category) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .sms-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        .sms-modal-card {
          background: #fff;
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          padding: 24px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25);
          animation: slideInUp 280ms ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .cat-btn {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px;
          padding: 10px 6px;
          border-radius: 10px;
          border: 2px solid transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: border-color 0.15s, transform 0.1s;
        }
        .cat-btn:hover { transform: scale(1.04); }
        .cat-btn.selected { border-color: currentColor; }
        .cat-emoji { font-size: 20px; line-height: 1; }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #D1D5DB;
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #10B981; }
        .btn-cancel {
          flex: 1; padding: 12px;
          border: 1.5px solid #D1D5DB;
          background: #fff;
          border-radius: 10px;
          font-size: 15px; font-weight: 600;
          cursor: pointer; color: #374151;
          transition: background 0.15s;
        }
        .btn-cancel:hover:not(:disabled) { background: #F9FAFB; }
        .btn-save {
          flex: 1; padding: 12px;
          background: #10B981;
          border: none;
          border-radius: 10px;
          font-size: 15px; font-weight: 600;
          cursor: pointer; color: #fff;
          transition: background 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-save:hover:not(:disabled) { background: #059669; }
        .btn-save:disabled, .btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; }
        .success-screen {
          text-align: center;
          padding: 12px 0 4px;
          animation: slideInUp 300ms ease-out;
        }
        .success-icon { animation: popIn 400ms ease-out; }
      `}</style>

      <div className="sms-modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
        <div className="sms-modal-card">

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>
              Categorize Transaction
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}
            >
              <X size={22} />
            </button>
          </div>

          {success ? (
            /* ── Success screen ── */
            <div className="success-screen">
              <div className="success-icon" style={{ marginBottom: 14 }}>
                <CheckCircle size={56} color="#10B981" />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#065F46', margin: '0 0 6px' }}>
                Transaction saved!
              </p>
              {savedData && (
                <>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#EF4444', margin: '8px 0 4px' }}>
                    -M{parseFloat(savedData.amount).toFixed(2)}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    background: selectedCat.bg,
                    color: selectedCat.color,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 10
                  }}>
                    {selectedCat.emoji} {savedData.category}
                  </span>
                  {extraction?.store && (
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
                      {extraction.store}
                    </p>
                  )}
                  {extraction?.balance != null && (
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: '6px 0 0' }}>
                      Bank balance: M{parseFloat(extraction.balance).toFixed(2)}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#10B981', marginTop: 10 }}>
                    Budget dashboard updated automatically
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* ── SMS preview ── */}
              <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  From: {smsMessage.sms_from || 'Unknown'}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4B5563', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{smsMessage.sms_text}"
                </p>

                {/* ML badges */}
                {extraction && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', alignSelf: 'center', marginRight: 2 }}>
                      ML:
                    </span>
                    {extraction.bank && (
                      <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {extraction.bank}
                      </span>
                    )}
                    {extraction.store && (
                      <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {extraction.store}
                      </span>
                    )}
                    {confidencePct !== null && (
                      <span style={{
                        background: isHighConfidence ? '#D1FAE5' : '#FEF3C7',
                        color: isHighConfidence ? '#065F46' : '#92400E',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600
                      }}>
                        {confidencePct}% confident
                      </span>
                    )}
                    {extraction.needs_manual_category && (
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        Confirm category
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── Amount ── */}
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Amount (M)</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* ── Category grid ── */}
              <div style={{ marginBottom: 4 }}>
                <label className="field-label">Category</label>
              </div>
              <div className="cat-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    className={`cat-btn${category === cat.label ? ' selected' : ''}`}
                    style={{
                      background: category === cat.label ? cat.bg : '#F9FAFB',
                      color: cat.color,
                    }}
                    onClick={() => setCategory(cat.label)}
                  >
                    <span className="cat-emoji">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Description ── */}
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">Description (optional)</label>
                <textarea
                  className="field-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any details..."
                  style={{ minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* ── Error ── */}
              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 16,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  color: '#DC2626', fontSize: 13
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Save summary line ── */}
              <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '0 0 14px' }}>
                Saving{' '}
                <strong style={{ color: '#111827' }}>M{parseFloat(amount || 0).toFixed(2)}</strong>
                {' '}→{' '}
                <strong style={{ color: selectedCat.color }}>{selectedCat.emoji} {category}</strong>
              </p>

              {/* ── Buttons ── */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-cancel" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSave} disabled={loading}>
                  {loading
                    ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                    : `Save M${parseFloat(amount || 0).toFixed(2)} → ${category}`
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}