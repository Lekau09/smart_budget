import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faX,
  faUtensils,
  faCartShopping,
  faBus,
  faTheaterMasks,
  faPills,
  faBolt,
  faBagShopping,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

/*
  CategoryConfirmationModal.jsx
  - Professional modal for manual SMS categorization
  - Shows transaction details and category options
  - Calls API to confirm category
  - Beautiful design matching SmartSpend theme
*/

const CATEGORY_ICONS = {
  'Food': faUtensils,
  'Groceries': faCartShopping,
  'Transport': faBus,
  'Entertainment': faTheaterMasks,
  'Health': faPills,
  'Utilities': faBolt,
  'Shopping': faBagShopping,
  'Other': faQuestionCircle,
};

function injectModalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('category-modal-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'category-modal-styles';
  style.innerHTML = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      padding: 0;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f1724;
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 20px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .modal-close:hover {
      color: #0f1724;
    }

    .modal-body {
      padding: 24px;
    }

    .transaction-summary {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .tx-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .tx-summary-row:last-child {
      margin-bottom: 0;
    }

    .tx-summary-label {
      color: #6b7280;
      font-weight: 600;
    }

    .tx-summary-value {
      color: #0f1724;
      font-weight: 700;
    }

    .tx-amount {
      color: #ef4444;
      font-size: 18px;
    }

    .category-prompt {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }

    .category-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 14px 12px;
      border: 2px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 12px;
      font-weight: 600;
      color: #0f1724;
    }

    .category-btn:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .category-btn.selected {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
    }

    .category-icon {
      font-size: 24px;
      margin-bottom: 6px;
    }

    .modal-footer {
      padding: 20px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #0f1724;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #3b82f6;
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

export default function CategoryConfirmationModal({ smsData, onConfirm, onCancel }) {
  injectModalStyles();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Food', 'Groceries', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Shopping', 'Other'];

  const handleConfirm = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/confirm_category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sms: smsData.raw_sms,
          category: selectedCategory,
          store: smsData.store,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm category');
      }

      const result = await response.json();
      onConfirm(result);
    } catch (err) {
      console.error('Error confirming category:', err);
      setError('Failed to confirm category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Transaction Category</h2>
          <button className="modal-close" onClick={onCancel}>
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <div className="modal-body">
          {/* Transaction Summary */}
          <div className="transaction-summary">
            <div className="tx-summary-row">
              <span className="tx-summary-label">Store:</span>
              <span className="tx-summary-value">{smsData.store || 'Unknown'}</span>
            </div>
            <div className="tx-summary-row">
              <span className="tx-summary-label">Amount:</span>
              <span className="tx-summary-value tx-amount">
                M{smsData.amount ? Number(smsData.amount).toFixed(2) : '0.00'}
              </span>
            </div>
            {smsData.suggested_category && (
              <div className="tx-summary-row">
                <span className="tx-summary-label">AI Suggestion:</span>
                <span className="tx-summary-value" style={{ color: '#10b981' }}>
                  {smsData.suggested_category}
                </span>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="category-prompt">
            Select the most appropriate category:
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <div className="category-icon">
                  <FontAwesomeIcon icon={CATEGORY_ICONS[cat] || faQuestionCircle} />
                </div>
                {cat}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleConfirm}
            disabled={!selectedCategory || loading}
          >
            {loading ? 'Confirming...' : 'Confirm Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
