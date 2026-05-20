import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { API_BASE } from '../config/api';
import { useNotification } from '../context/NotificationContext';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];



const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
  background: 'var(--bg-primary)', color: 'var(--text-primary)',
  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

export default function SetBudgetModal({
  isOpen, onClose, currentBudget, userId, month, year, onBudgetUpdated
}) {
  const { addNotification } = useNotification();
  const today = new Date();
  const [amount,         setAmount]         = useState('');
  const [selectedMonth,  setSelectedMonth]  = useState(today.getMonth() + 1);
  const [selectedYear,   setSelectedYear]   = useState(today.getFullYear());
  const [applyAll,       setApplyAll]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [done,           setDone]           = useState(false);


  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget?.monthly_budget || '');
      setDone(false);

      
      // Set month/year from props if available
      if (month) setSelectedMonth(month);
      if (year) setSelectedYear(year);
    }
  }, [isOpen, currentBudget, month, year]);

  if (!isOpen) return null;

  const totalBudget = Number(amount) || 0;


  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      addNotification('Please enter a valid budget amount', 'error', false);
      return;
    }

    if (!userId) {
      addNotification('User ID not found', 'error', false);
      console.error('[SetBudgetModal] userId is missing:', userId);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id:          userId,
        monthly_budget:   Number(amount),
        month:            applyAll ? 0 : selectedMonth,
        year:             applyAll ? 0 : selectedYear,
      };
      
      console.log('[SetBudgetModal] Submitting budget:', payload);
      
      const res  = await fetch(`${API_BASE}/update-budget.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      
      console.log('[SetBudgetModal] Response status:', res.status);
      const data = await res.json();
      console.log('[SetBudgetModal] Response data:', data);
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update budget');
      }
      
      addNotification(`Budget set to M${Number(amount).toLocaleString()}`, 'success', false);
      setDone(true);
      onBudgetUpdated?.();
      setTimeout(() => { onClose(); setDone(false); }, 1100);
    } catch (err) {
      const errorMsg = err.message || 'Failed to update budget';
      console.error('[SetBudgetModal] Error:', errorMsg);
      addNotification(errorMsg, 'error', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9998, padding: 16,
      animation: 'fadeIn 0.3s ease-out'
    }}
    onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        animation: 'slideInUp 200ms ease',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '20px 22px 0',
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700,
              color: 'var(--text-primary)', margin: 0 }}>
              Set Monthly Budget
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 4,
          }}>
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: '18px 22px' }}>
          <form onSubmit={handleSave}>
            {/* Total amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                color: 'var(--text-muted)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total budget (M)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18, fontWeight: 700, color: 'var(--text-muted)',
                }}>M</span>
                <input
                  type="number" min="0" step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    ...inputStyle, paddingLeft: 28,
                    fontSize: 22, fontWeight: 800,
                    color: 'var(--primary-main)',
                  }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                This is the maximum you plan to spend each month
              </p>
            </div>

            {/* Month / Year */}
            {!applyAll && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', marginBottom: 5,
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</label>
                  <select value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    style={inputStyle}>
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', marginBottom: 5,
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</label>
                  <select value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    style={inputStyle}>
                    {[2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Apply to all months */}
            <div
              onClick={() => setApplyAll(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: `1px solid ${applyAll ? 'var(--primary-main)' : 'var(--border-light)'}`,
                cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.15s',
              }}>
              <div style={{
                width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${applyAll ? 'var(--primary-main)' : 'var(--border-main)'}`,
                background: applyAll ? 'var(--primary-main)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {applyAll && <Check size={10} color="white" strokeWidth={3} />}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600,
                  color: 'var(--text-primary)' }}>Apply to all months</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                  Use this as the default budget going forward
                </p>
              </div>
            </div>



            {/* Summary */}
            {amount && Number(amount) > 0 && (
              <div style={{
                padding: '9px 12px', marginBottom: 16,
                background: 'var(--primary-lighter)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12, color: 'var(--primary-main)', fontWeight: 600,
              }}>
                {applyAll
                  ? `M${Number(amount).toLocaleString()} default for all future months`
                  : `M${Number(amount).toLocaleString()} for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '11px', background: 'none',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-md)', fontSize: 14,
                cursor: 'pointer', color: 'var(--text-secondary)',
                opacity: saving ? 0.5 : 1,
              }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !amount || Number(amount) <= 0}
                style={{
                  flex: 2, padding: '11px', border: 'none',
                  borderRadius: 'var(--radius-md)', fontSize: 14,
                  fontWeight: 700, color: 'white',
                  cursor: (saving || !amount || Number(amount) <= 0)
                    ? 'not-allowed' : 'pointer',
                  background: done ? 'var(--success)' : 'var(--primary-main)',
                  opacity: (!amount || Number(amount) <= 0) ? 0.5 : 1,
                  transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 7,
                }}>
                {done ? <><Check size={15}/> Saved!</>
                  : saving ? 'Saving...'
                  : 'Set Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
