import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/smart_budget/api';

export default function SetBudgetModal({ isOpen, onClose, currentBudget, userId, onBudgetUpdated }) {
  const { addNotification } = useNotification();
  const [budget, setBudget] = useState(currentBudget || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!budget || Number(budget) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/update-budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          monthly_budget: Number(budget)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update budget');
      }

      addNotification(`Budget set to M${Number(budget).toLocaleString()}`, 'success', false);
      onBudgetUpdated(Number(budget));
      onClose();
    } catch (err) {
      const errorMsg = err.message || 'Failed to update budget';
      setError(errorMsg);
      addNotification(errorMsg, 'error', false);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '0.875rem',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 32px rgba(0, 0, 0, 0.12)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)'
            }}
          >
            Set Monthly Budget
          </h2>
          <button
            onClick={onClose}
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
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Budget Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)'
              }}
            >
              Monthly Budget (M)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter your budget"
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: 'var(--font-size-base)',
                border: '1px solid var(--border)',
                borderRadius: '0.65rem',
                fontFamily: 'var(--font-family)',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease, box-shadow 150ms ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(10, 92, 224, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={saving}
            />
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                margin: '0.5rem 0 0 0'
              }}
            >
              This is the maximum you plan to spend each month
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                borderLeft: '4px solid #DC2626',
                color: '#7F1D1D',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-secondary"
              style={{
                opacity: saving ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
