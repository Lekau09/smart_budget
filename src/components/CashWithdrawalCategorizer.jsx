import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { API_BASE } from '../config/api';
import { useAuth } from '../hooks/useAuth';

const CashWithdrawalCategorizer = ({ onCategorize }) => {
  const { user } = useAuth();
  const [uncategorized, setUncategorized] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const CASH_CATEGORIES = [
    'Food',
    'Groceries',
    'Transport',
    'Entertainment',
    'Health',
    'Utilities',
    'Shopping',
    'Other'
  ];

  useEffect(() => {
    fetchUncategorizedTransactions();
  }, []);

  const fetchUncategorizedTransactions = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const url = `${API_BASE}/get_uncategorized_withdrawals.php?user_id=${user.id}`;
      console.log('Fetching uncategorized withdrawals from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Response data:', data);
      
      if (data.success && data.transactions) {
        setUncategorized(data.transactions);
      } else {
        setUncategorized([]);
      }
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setFetchError(error.message);
      setUncategorized([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorize = async () => {
    if (!category) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }

    setSubmitting(true);
    try {
      const url = `${API_BASE}/categorize_cash_withdrawal.php`;
      const payload = {
        transaction_id: selectedTransaction.id,
        category: category,
        description: description,
        user_id: user?.id
      };
      
      console.log('Sending categorization request to:', url);
      console.log('Payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      let data = null;
      let responseText = null;
      
      try {
        responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        console.log('Raw response:', responseText);
        
        const errorMsg = responseText 
          ? `Server error: ${responseText.substring(0, 100)}`
          : 'Server returned empty response';
        
        setMessage({ type: 'error', text: errorMsg });
        setSubmitting(false);
        return;
      }

      if (response.ok && data && data.success) {
        setMessage({ type: 'success', text: 'Cash withdrawal categorized successfully!' });
        
        // Call onCategorize callback to refresh list
        if (onCategorize) {
          onCategorize();
        }
        
        // Remove from uncategorized list
        const updated = uncategorized.filter(t => t.id !== selectedTransaction.id);
        setUncategorized(updated);
        
        // Close modal
        setTimeout(() => {
          setSelectedTransaction(null);
          setCategory('');
          setDescription('');
          setMessage(null);
        }, 1500);
      } else {
        const errorMsg = data?.error || data?.message || 'Failed to categorize transaction';
        console.error('API error:', errorMsg);
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      console.error('Fetch error details:', error);
      setMessage({ type: 'error', text: 'Network error: ' + error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '16px' }}>Loading withdrawals...</div>;
  }

  if (fetchError) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#7f1d1d', fontWeight: '500', margin: '0 0 4px 0' }}>
            Error loading withdrawals
          </p>
          <p style={{ color: '#991b1b', fontSize: '14px', margin: 0 }}>
            {fetchError}
          </p>
        </div>
      </div>
    );
  }

  if (!uncategorized || uncategorized.length === 0) {
    return (
      <div style={{
        backgroundColor: '#dcfce7',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0 }} />
        <p style={{ color: '#166534', fontWeight: '500', margin: 0 }}>
          All cash withdrawals are categorized!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fetchError && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#7f1d1d', fontWeight: '500', margin: '0 0 4px 0' }}>
              Error loading withdrawals
            </p>
            <p style={{ color: '#991b1b', fontSize: '14px', margin: 0 }}>
              {fetchError}
            </p>
          </div>
        </div>
      )}

      {loading && !fetchError && (
        <div style={{ textAlign: 'center', padding: '16px' }}>Loading withdrawals...</div>
      )}

      {!loading && !fetchError && (!uncategorized || uncategorized.length === 0) && (
        <div style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0 }} />
          <p style={{ color: '#166534', fontWeight: '500', margin: 0 }}>
            All cash withdrawals are categorized!
          </p>
        </div>
      )}

      {!loading && !fetchError && uncategorized && uncategorized.length > 0 && (
        <>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle style={{ width: '24px', height: '24px', color: '#2563eb', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontWeight: '600', color: '#1e3a8a', margin: '0 0 4px 0' }}>
                Uncategorized Cash Withdrawals
              </h3>
              <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                You have {uncategorized.length} cash withdrawal{uncategorized.length !== 1 ? 's' : ''} 
                that need categorization. Please tell us what you used the cash for.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {uncategorized.map(trans => (
              <div key={trans.id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                    {trans.description}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                    Amount: <span style={{ fontWeight: '600' }}>M{trans.amount}</span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>
                    {trans.transaction_date}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(trans)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 200ms',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Categorize
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {selectedTransaction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            maxWidth: '448px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                Categorize Cash Withdrawal
              </h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>
                Amount
              </p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                M{selectedTransaction.amount}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                {selectedTransaction.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  What did you use the cash for? *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Select a category...</option>
                  {CASH_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Bought groceries for the week"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '72px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {message && (
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                  color: message.type === 'error' ? '#991b1b' : '#166534',
                  border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: '1px solid #d1d5db',
                    color: '#4b5563',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 200ms'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCategorize}
                  disabled={submitting || !category}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submitting || !category ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 200ms',
                    opacity: submitting || !category ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !submitting && !category && (e.target.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => !submitting && !category && (e.target.style.backgroundColor = '#2563eb')}
                >
                  {submitting ? 'Saving...' : 'Save Categorization'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashWithdrawalCategorizer;
