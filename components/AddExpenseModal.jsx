import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUtensils, faCartShopping, faCoffee, faBolt, faBus, faQuestionCircle, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../src/context/BudgetContext';

const CATEGORIES = [
  { name: 'Food',          icon: faUtensils,      color: '#EF4444' },
  { name: 'Groceries',     icon: faCartShopping,  color: '#F59E0B' },
  { name: 'Transport',     icon: faBus,           color: '#3B82F6' },
  { name: 'Entertainment', icon: faCoffee,        color: '#8B5CF6' },
  { name: 'Health',        icon: faCreditCard,    color: '#10B981' },
  { name: 'Utilities',     icon: faBolt,          color: '#FBBF24' },
  { name: 'Shopping',      icon: faCartShopping,  color: '#EC4899' },
  { name: 'Subscriptions', icon: faCreditCard,    color: '#06B6D4' },
  { name: 'Other',         icon: faQuestionCircle,color: '#64748B' }
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
      await addExpense(form.merchant, parseFloat(form.amount), form.category, date);
      if (onAdd) onAdd();
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

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 200ms ease', cursor: 'pointer'
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', padding: '16px',
          animation: 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          backgroundColor: 'var(--bg-primary)', borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px', borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)',
            borderRadius: '16px 16px 0 0'
          }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                Add Transaction
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--neutral-500)', margin: '4px 0 0 0', fontWeight: '500' }}>
                Record your spending
              </p>
            </div>
            <button onClick={onClose} style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms ease', color: 'var(--neutral-600)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor='var(--error)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--error)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor='var(--surface-secondary)'; e.currentTarget.style.color='var(--neutral-600)'; e.currentTarget.style.borderColor='var(--border)'; }}
            aria-label="Close dialog">
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: '18px' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{
                padding: '12px 16px', backgroundColor: 'var(--error-light)',
                border: '1px solid var(--error)', borderRadius: 'var(--radius-md)',
                color: 'var(--error)', fontSize: '13px', fontWeight: '600',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
                animation: 'slideDown 300ms ease'
              }}>
                <span>⚠️</span>{error}
              </div>
            )}

            {/* Where */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>
                Where did you spend?
              </label>
              <input type="text" required value={form.merchant}
                onChange={e => { setForm({...form, merchant: e.target.value}); setError(''); }}
                style={{ width:'100%', padding:'12px 16px', border:'1px solid var(--border-main)', borderRadius:'var(--radius-md)', fontSize:'15px', fontFamily:'inherit', backgroundColor:'var(--bg-secondary)', color:'var(--text-primary)', transition:'all 150ms ease', outline:'none' }}
                onFocus={e => { e.target.style.borderColor='var(--primary-main)'; e.target.style.boxShadow='0 0 0 3px rgba(11, 95, 255, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border-main)'; e.target.style.boxShadow='none'; }}
                placeholder="e.g., Coffee Shop, Grocery Store"
              />
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>
                How much?
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'15px', fontWeight:'700', color:'var(--neutral-500)' }}>M</span>
                <input type="number" required step="0.01" min="0" value={form.amount}
                  onChange={e => { setForm({...form, amount: e.target.value}); setError(''); }}
                  style={{ width:'100%', padding:'12px 16px 12px 32px', border:'1px solid var(--border-main)', borderRadius:'var(--radius-md)', fontSize:'15px', fontFamily:'inherit', backgroundColor:'var(--bg-secondary)', color:'var(--text-primary)', transition:'all 150ms ease', outline:'none' }}
                  onFocus={e => { e.target.style.borderColor='var(--primary-main)'; e.target.style.boxShadow='0 0 0 3px rgba(11, 95, 255, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border-main)'; e.target.style.boxShadow='none'; }}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category grid */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--neutral-700)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>
                Category
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(65px, 1fr))', gap:'10px' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.name} type="button"
                    onClick={() => setForm({...form, category: cat.name})}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-lg)',
                      border: form.category === cat.name ? `2px solid ${cat.color}` : '1px solid var(--border)',
                      backgroundColor: form.category === cat.name ? `${cat.color}20` : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 150ms ease',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '6px',
                      fontSize: '11px', fontWeight: '600',
                      color: form.category === cat.name ? cat.color : 'var(--text-secondary)',
                      minHeight: '80px', justifyContent: 'center'
                    }}
                    onMouseEnter={e => { if (form.category !== cat.name) { e.currentTarget.style.backgroundColor=`${cat.color}12`; e.currentTarget.style.color=cat.color; e.currentTarget.style.borderColor=cat.color; }}}
                    onMouseLeave={e => { if (form.category !== cat.name) { e.currentTarget.style.backgroundColor='var(--bg-secondary)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border-main)'; }}}
                  >
                    <FontAwesomeIcon icon={cat.icon} style={{ fontSize: '20px' }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>
                Note (Optional)
              </label>
              <input type="text" value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                style={{ width:'100%', padding:'12px 16px', border:'1px solid var(--border-main)', borderRadius:'var(--radius-md)', fontSize:'13px', fontFamily:'inherit', backgroundColor:'var(--bg-secondary)', color:'var(--text-primary)', transition:'all 150ms ease', outline:'none' }}
                onFocus={e => { e.target.style.borderColor='var(--primary-main)'; e.target.style.boxShadow='0 0 0 3px rgba(11, 95, 255, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor='var(--border-main)'; e.target.style.boxShadow='none'; }}
                placeholder="e.g., Lunch with friends"
              />
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:'12px', marginTop:'32px' }}>
              <button type="button" onClick={onClose} style={{
                flex:1, padding:'12px 20px', backgroundColor:'var(--bg-secondary)',
                color:'var(--text-secondary)', border:'1px solid var(--border-main)',
                borderRadius:'var(--radius-lg)', fontSize:'14px', fontWeight:'600', cursor:'pointer', transition:'all 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor='var(--border-main)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--bg-secondary)'}>
                Cancel
              </button>
              <button type="submit" disabled={isSaving} style={{
                flex:1, padding:'12px 20px',
                backgroundColor: isSaving ? '#BDBDBD' : '#0946CC',
                color:'#ffffff', border:'none', borderRadius:'12px',
                fontSize:'14px', fontWeight:'700',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition:'transform 120ms ease, box-shadow 120ms ease',
                boxShadow: isSaving ? 'none' : '0 8px 20px rgba(9,70,204,0.18)',
                display:'flex', alignItems:'center', justifyContent:'center',
                gap:'8px', opacity: isSaving ? 0.8 : 1
              }}
              onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.backgroundColor='#0633a6'; e.currentTarget.style.transform='translateY(-2px)'; }}}
              onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.backgroundColor='#0946CC'; e.currentTarget.style.transform='translateY(0)'; }}}>
                {isSaving ? '💾 Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>

          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes modalSlideIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
        </div>
      </div>
    </>
  );
}