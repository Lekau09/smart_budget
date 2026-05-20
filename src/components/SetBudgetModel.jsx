import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE } from '../config/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const CATEGORIES = [
  { name: 'Food',          color: '#EF4444', emoji: '🍽️' },
  { name: 'Groceries',     color: '#F59E0B', emoji: '🛒' },
  { name: 'Transport',     color: '#3B82F6', emoji: '🚌' },
  { name: 'Entertainment', color: '#8B5CF6', emoji: '🎬' },
  { name: 'Health',        color: '#10B981', emoji: '💊' },
  { name: 'Utilities',     color: '#FBBF24', emoji: '⚡' },
  { name: 'Shopping',      color: '#EC4899', emoji: '🛍️' },
  { name: 'Subscriptions', color: '#06B6D4', emoji: '📱' },
  { name: 'Other',         color: '#64748B', emoji: '📦' },
];

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
  background: 'var(--bg-primary)', color: 'var(--text-primary)',
  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

export default function SetBudgetModal({
  isOpen, onClose, userId, currentBudget, onBudgetUpdate
}) {
  const today = new Date();
  const [amount,         setAmount]         = useState('');
  const [month,          setMonth]          = useState(today.getMonth() + 1);
  const [year,           setYear]           = useState(today.getFullYear());
  const [applyAll,       setApplyAll]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [done,           setDone]           = useState(false);
  const [showCatBudgets, setShowCatBudgets] = useState(false);
  const [catBudgets,     setCatBudgets]     = useState({});

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget?.monthly_budget || '');
      setDone(false);
      setCatBudgets({});
      setShowCatBudgets(false);
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const totalBudget = Number(amount) || 0;
  const catTotal    = Object.values(catBudgets)
    .reduce((s, v) => s + (Number(v) || 0), 0);
  const unallocated = totalBudget - catTotal;

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      const payload = {
        user_id:          userId,
        monthly_budget:   Number(amount),
        month:            applyAll ? 0 : month,
        year:             applyAll ? 0 : year,
        category_budgets: catBudgets,
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
        setTimeout(() => { onClose(); setDone(false); }, 1100);
      }
    } catch (e) {
      console.error('Set budget failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        animation: 'slideInUp 200ms ease',
      }}>

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
              {MONTHS[month - 1]} {year}
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
                type="number" min="0" step="100" autoFocus
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
          </div>

          {/* Month / Year */}
          {!applyAll && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                  color: 'var(--text-muted)', marginBottom: 5,
                  textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</label>
                <select value={month}
                  onChange={e => setMonth(Number(e.target.value))}
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
                <select value={year}
                  onChange={e => setYear(Number(e.target.value))}
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

          {/* Per-category budgets — collapsible */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowCatBudgets(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: showCatBudgets
                  ? 'var(--radius-md) var(--radius-md) 0 0'
                  : 'var(--radius-md)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
              <span>
                Per-category limits
                <span style={{ fontSize: 11, color: 'var(--text-muted)',
                  fontWeight: 400, marginLeft: 6 }}>optional</span>
              </span>
              {showCatBudgets
                ? <ChevronUp  size={15} style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
            </button>

            {showCatBudgets && (
              <div style={{
                border: '1px solid var(--border-light)', borderTop: 'none',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                overflow: 'hidden',
              }}>
                {/* Unallocated indicator */}
                {totalBudget > 0 && (
                  <div style={{
                    padding: '7px 12px', fontSize: 11, fontWeight: 600,
                    background: unallocated < 0 ? '#FEF2F2' : '#F0FDF4',
                    color:      unallocated < 0 ? '#DC2626' : '#166834',
                    borderBottom: '1px solid var(--border-light)',
                  }}>
                    {unallocated < 0
                      ? `⚠ Over by M${Math.abs(unallocated).toLocaleString()} — reduce category limits`
                      : `M${unallocated.toLocaleString()} unallocated`}
                  </div>
                )}

                {CATEGORIES.map((cat, i) => (
                  <div key={cat.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    borderBottom: i < CATEGORIES.length - 1
                      ? '1px solid var(--border-light)' : 'none',
                    background: 'var(--bg-primary)',
                  }}>
                    <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600,
                      color: 'var(--text-primary)' }}>
                      {cat.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)',
                        fontWeight: 600 }}>M</span>
                      <input
                        type="number" min="0" step="50"
                        placeholder="—"
                        value={catBudgets[cat.name] || ''}
                        onChange={e => setCatBudgets(prev => ({
                          ...prev, [cat.name]: e.target.value,
                        }))}
                        style={{
                          ...inputStyle, width: 88, padding: '6px 8px',
                          fontSize: 13, fontWeight: 700,
                          color: cat.color,
                          borderColor: catBudgets[cat.name]
                            ? cat.color + '60' : 'var(--border-main)',
                        }}
                      />
                    </div>

                    {/* Mini % bar */}
                    {totalBudget > 0 && catBudgets[cat.name] > 0 && (
                      <div style={{ width: 44, flexShrink: 0 }}>
                        <div style={{ height: 3, background: 'var(--bg-tertiary)',
                          borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', background: cat.color, borderRadius: 99,
                            width: `${Math.min(100,
                              (Number(catBudgets[cat.name]) / totalBudget) * 100
                            )}%`,
                          }} />
                        </div>
                        <p style={{ margin: '1px 0 0', fontSize: 9,
                          color: 'var(--text-muted)', textAlign: 'right' }}>
                          {Math.round(
                            (Number(catBudgets[cat.name]) / totalBudget) * 100
                          )}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                : `M${Number(amount).toLocaleString()} for ${MONTHS[month - 1]} ${year}`}
              {Object.keys(catBudgets).filter(k => catBudgets[k] > 0).length > 0 && (
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                  {' · '}
                  {Object.keys(catBudgets).filter(k => catBudgets[k] > 0).length} category limits
                </span>
              )}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', background: 'none',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-md)', fontSize: 14,
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
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
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}