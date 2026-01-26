import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUtensils, faCartShopping, faCoffee, faBolt, faBus, faQuestionCircle, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../src/context/BudgetContext';

const CATEGORIES = [
  { name: 'Food', icon: faUtensils, color: '#EF4444' },
  { name: 'Groceries', icon: faCartShopping, color: '#F59E0B' },
  { name: 'Coffee', icon: faCoffee, color: '#8B5CF6' },
  { name: 'Bills', icon: faBolt, color: '#3B82F6' },
  { name: 'Transport', icon: faBus, color: '#10B981' },
  { name: 'Shopping', icon: faCreditCard, color: '#EC4899' },
  { name: 'Other', icon: faQuestionCircle, color: '#6B7280' },
];

export default function AddExpenseModal({ isOpen, onClose, onAdd }) {
  const { addExpense } = useBudget();
  const [form, setForm] = useState({
    merchant: '',
    amount: '',
    category: 'Food',
    note: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.merchant.trim()) {
      setError('Please enter where you spent');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSaving(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      
      // Save to database using the BudgetContext
      await addExpense(
        form.merchant,
        parseFloat(form.amount),
        form.category,
        date
      );
      
      // Call onAdd callback to refresh UI
      if (onAdd) {
        onAdd();
      }
      
      // Close modal and reset form
      onClose();
      setForm({ merchant: '', amount: '', category: 'Food', note: '' });
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = CATEGORIES.find(c => c.name === form.category);

  return (
    <>
      {/* Backdrop with animation */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 200ms ease',
          cursor: 'pointer'
        }}
        onClick={onClose}
      />

      {/* Modal with animation */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px',
          animation: 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '@media (min-width: 768px)': {
            alignItems: 'center'
          }
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal card */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            borderRadius: '16px 16px 0 0'
          }}>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--neutral-900)',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Add Transaction
              </h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--neutral-500)',
                margin: '4px 0 0 0',
                fontWeight: '500'
              }}>
                Record your spending
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease',
                color: 'var(--neutral-600)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--error)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--neutral-600)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              aria-label="Close dialog"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: '18px' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--error-light)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'slideDown 300ms ease'
              }}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Where You Spent */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--neutral-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                Where did you spend?
              </label>
              <input
                type="text"
                required
                value={form.merchant}
                onChange={e => {
                  setForm({ ...form, merchant: e.target.value });
                  setError('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  transition: 'all 150ms ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(11, 95, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="e.g., Coffee Shop, Grocery Store"
                aria-label="Where you spent"
              />
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--neutral-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                How much?
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--neutral-500)'
                }}>
                  M
                </span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => {
                    setForm({ ...form, amount: e.target.value });
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 32px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    transition: 'all 150ms ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(11, 95, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="0.00"
                  aria-label="Amount spent"
                />
              </div>
            </div>

            {/* Category Selection - Visual Grid */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--neutral-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                Category
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
                gap: '10px'
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.name })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-lg)',
                      border: form.category === cat.name ? `2px solid ${cat.color}` : '1px solid var(--border)',
                      backgroundColor: form.category === cat.name ? `${cat.color}15` : 'white',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: form.category === cat.name ? cat.color : 'var(--neutral-600)',
                      minHeight: '80px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (form.category !== cat.name) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (form.category !== cat.name) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={cat.icon} style={{ fontSize: '20px' }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--neutral-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                Note (Optional)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  transition: 'all 150ms ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(11, 95, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="e.g., Lunch with friends"
                aria-label="Optional note"
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--neutral-600)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: isSaving ? '#ccc' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSaving ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }
                }}
              >
                {isSaving ? '💾 Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>

          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes modalSlideIn {
              from { transform: translateY(40px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideDown {
              from { transform: translateY(-10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
