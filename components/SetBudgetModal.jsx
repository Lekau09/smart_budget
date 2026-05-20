import React, { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { API_BASE } from '../config/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function SetBudgetModal({ isOpen, onClose, userId, currentBudget, onBudgetUpdate }) {
  const today = new Date();
  const [amount,   setAmount]   = useState('');
  const [month,    setMonth]    = useState(today.getMonth() + 1); // 1-12
  const [year,     setYear]     = useState(today.getFullYear());
  const [applyAll, setApplyAll] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget?.monthly_budget || '');
      setDone(false);
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      const payload = {
        user_id:        userId,
        monthly_budget: Number(amount),
        month:          applyAll ? 0 : month,
        year:           applyAll ? 0 : year,
      };
      const res  = await fetch(`${API_BASE}/set-budget.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        onBudgetUpdate?.();
        setTimeout(() => { onClose(); setDone(false); }, 1200);
      }
    } catch (e) {
      console.error('Set budget failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
        padding: '28px 30px', maxWidth: 400, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        animation: 'slideInUp 200ms ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700,
              color: 'var(--text-primary)', margin: 0 }}>Set Monthly Budget</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Define how much you plan to spend
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 4,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
            color: 'var(--text-secondary)', marginBottom: 7,
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Budget Amount (M)
          </label>
          <input
            type="number" min="0" step="100" autoFocus
            placeholder="e.g. 6500"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', fontSize: 22,
              fontWeight: 700, color: 'var(--primary-main)',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Month / Year (only shown when not applying to all) */}
        {!applyAll && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 7,
                textTransform: 'uppercase', letterSpacing: '0.4px' }}>Month</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)', fontSize: 14,
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  boxSizing: 'border-box' }}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 7,
                textTransform: 'uppercase', letterSpacing: '0.4px' }}>Year</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)', fontSize: 14,
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  boxSizing: 'border-box' }}>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Apply to all months toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', marginBottom: 20,
          cursor: 'pointer', border: '1px solid var(--border-light)' }}
          onClick={() => setApplyAll(v => !v)}>
          <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            border: `2px solid ${applyAll ? 'var(--primary-main)' : 'var(--border-main)'}`,
            background: applyAll ? 'var(--primary-main)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {applyAll && <Check size={11} color="white" strokeWidth={3} />}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600,
              color: 'var(--text-primary)' }}>Apply to all months</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Use this budget as the default for every month
            </p>
          </div>
        </div>

        {/* Summary */}
        {amount && Number(amount) > 0 && (
          <div style={{ padding: '10px 14px', background: 'var(--primary-lighter)',
            borderRadius: 'var(--radius-md)', marginBottom: 18,
            fontSize: 13, color: 'var(--primary-main)', fontWeight: 500 }}>
            {applyAll
              ? `Setting M${Number(amount).toLocaleString()} as default budget for all months`
              : `Setting M${Number(amount).toLocaleString()} budget for ${MONTHS[month-1]} ${year}`
            }
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', background: 'none',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-md)', fontSize: 14,
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !amount || Number(amount) <= 0}
            style={{
              flex: 2, padding: '11px', border: 'none',
              borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 700,
              color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
              background: done ? 'var(--success)' : 'var(--primary-main)',
              opacity: (!amount || Number(amount) <= 0) ? 0.5 : 1,
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
            {done ? <><Check size={15} /> Saved!</>
              : saving ? 'Saving...'
              : <><Calendar size={15} /> Set Budget</>
            }
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}