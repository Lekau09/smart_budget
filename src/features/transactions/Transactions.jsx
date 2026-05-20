import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBudget } from '../../context/BudgetContext';
import {
  Trash2, RotateCcw, RotateCw, Edit2, Check, X,
  Plus, Search, Wallet, Clock, CreditCard,
  Coffee, ShoppingCart, Bus, Zap, Heart, ShoppingBag,
  HelpCircle, AlertCircle, Brain
} from 'lucide-react';
import PageContainer from '../../components/layouts/PageContainer';
import { useNotification } from '../../context/NotificationContext';
import AddExpenseModal from '../../../components/AddExpenseModal';
import CategorizationFeedback from '../../components/CategorizationFeedback';
import { API_BASE } from '../../config/api';

const ML_API = 'http://localhost:5000';

const CATEGORIES = [
  { name: 'Food',          icon: Coffee,       color: '#EF4444' },
  { name: 'Groceries',     icon: ShoppingCart, color: '#F59E0B' },
  { name: 'Transport',     icon: Bus,          color: '#3B82F6' },
  { name: 'Entertainment', icon: Zap,          color: '#8B5CF6' },
  { name: 'Health',        icon: Heart,        color: '#10B981' },
  { name: 'Utilities',     icon: Zap,          color: '#FBBF24' },
  { name: 'Shopping',      icon: ShoppingBag,  color: '#EC4899' },
  { name: 'Subscriptions', icon: CreditCard,   color: '#06B6D4' },
  { name: 'Other',         icon: HelpCircle,   color: '#64748B' },
];
const CAT_MAP = CATEGORIES.reduce((a,c) => ({ ...a, [c.name]: c }), {});

const inputStyle = {
  padding: '9px 12px', border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius-md)', fontSize: 13, width: '100%',
  background: 'var(--bg-primary)', color: 'var(--text-primary)',
  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
};

// ── Category Picker Modal ─────────────────────────────────────
function CategoryPickerModal({ item, onSelect, onCancel, saving, mode }) {
  const [storeName, setStoreName] = useState('');
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:9999, padding:16,
    }}>
      <div style={{
        background:'var(--bg-primary)', borderRadius:'var(--radius-xl)',
        padding:'24px 26px', maxWidth:420, width:'100%',
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        animation:'cpSlideIn 200ms ease',
      }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            {mode === 'review'
              ? <Brain size={18} style={{ color:'#8B5CF6' }} />
              : <Wallet size={18} style={{ color:'#D97706' }} />
            }
            <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:0 }}>
              {mode === 'review' ? 'Help the AI learn' : 'What was this cash used for?'}
            </h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>
            <strong style={{ color:'var(--danger)' }}>M{Number(item.amount).toFixed(2)}</strong>
            {' '}from <strong>{item.description || 'Unknown'}</strong>
          </p>
          {mode === 'review' && (
            <p style={{ fontSize:12, color:'#8B5CF6', margin:'6px 0 0',
              background:'#F5F3FF', padding:'6px 10px', borderRadius:6 }}>
              The AI wasn't confident about this one. Your choice teaches it for next time.
            </p>
          )}
        </div>

        {mode === 'withdrawal' && (
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>
              Store / Merchant Name (optional)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="e.g., TheselePub, Shoprite, Pick n Pay"
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.name} onClick={() => onSelect(item, cat.name, storeName.trim() || null)} disabled={saving}
                style={{
                  padding:'12px 6px', border:'1px solid var(--border-light)',
                  borderRadius:'var(--radius-lg)', background:'var(--bg-primary)',
                  cursor:saving?'not-allowed':'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  fontSize:11, fontWeight:600, color:'var(--text-secondary)',
                  transition:'all 0.15s', opacity:saving?0.6:1,
                }}
                onMouseEnter={e => { if(!saving){ e.currentTarget.style.borderColor=cat.color; e.currentTarget.style.background=cat.color+'12'; e.currentTarget.style.color=cat.color; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.background='var(--bg-primary)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                <Icon size={20} style={{ color:cat.color }} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <button onClick={onCancel} style={{
          width:'100%', padding:'10px', background:'none',
          border:'1px solid var(--border-main)', borderRadius:'var(--radius-md)',
          fontSize:13, cursor:'pointer', color:'var(--text-secondary)' }}>
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes cpSlideIn {
          from { transform:translateY(20px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
      `}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Transactions() {
  const { user }            = useAuth();
  const { addNotification } = useNotification();
  const {
    expenses, loading,
    addExpense, deleteExpense, updateExpense, fetchExpenses
  } = useBudget();

  const [filterCategory,     setFilterCategory]     = useState('All');
  const [searchQuery,        setSearchQuery]         = useState('');
  const [sortBy,             setSortBy]              = useState('date-desc');
  const [editingId,          setEditingId]           = useState(null);
  const [editData,           setEditData]            = useState({});
  const [showAddModal,       setShowAddModal]        = useState(false);
  const [withdrawals,        setWithdrawals]         = useState([]);
  const [needsReview,        setNeedsReview]         = useState([]);
  const [pickerItem,         setPickerItem]          = useState(null);
  const [pickerMode,         setPickerMode]          = useState('withdrawal');
  const [categorizingSaving, setCategorizingSaving]  = useState(false);
  const [feedback,            setFeedback]            = useState(null);

  // ── Undo/Redo — simple stack, not tied to expenses effect ──
  const [undoStack, setUndoStack] = useState([]);  // actions that can be undone
  const [redoStack, setRedoStack] = useState([]);  // actions that can be redone
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear());

  useEffect(() => { if (user?.id) fetchExpenses(); }, [user?.id]);

  // Poll every 10 seconds — picks up transactions saved by Python extractor
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetchExpenses();
      fetchWithdrawals();
      fetchNeedsReview();
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchWithdrawals = async () => {
    if (!user?.id) return;
    try {
      const res  = await fetch(`${API_BASE}/get-uncategorized-withdrawals.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) setWithdrawals(data.withdrawals || []);
    } catch {}
  };

  const fetchNeedsReview = async () => {
    if (!user?.id) return;
    try {
      const res  = await fetch(`${API_BASE}/get-needs-review.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) setNeedsReview(data.items || data.needs_review || []);
    } catch {}
  };

  useEffect(() => { fetchWithdrawals(); fetchNeedsReview(); }, [user?.id]);

  useEffect(() => {
    const handler = e => setSearchQuery(e.detail?.query || '');
    window.addEventListener('globalSearch', handler);
    return () => window.removeEventListener('globalSearch', handler);
  }, []);

  // ── Push to undo stack whenever user makes a change ──
  const pushUndo = useCallback((action) => {
    setUndoStack(s => [...s, action]);
    setRedoStack([]);  // new action clears redo stack
  }, []);

  // ── Delete ──
  const handleDelete = async (id, description, amount, category, date) => {
    if (!window.confirm(`Delete "${description}"?`)) return;
    try {
      await deleteExpense(id);
      pushUndo({ type:'delete', id, description, amount, category, date });
      addNotification('Transaction deleted', 'success');
      fetchWithdrawals(); fetchNeedsReview();
    } catch { addNotification('Failed to delete', 'error'); }
  };

  // ── Edit ──
  const handleEditSave = async id => {
    // Find original values before saving (for undo)
    const original = (expenses||[]).find(e => e.id === id);
    try {
      await updateExpense(id, editData.description, parseFloat(editData.amount), editData.category, editData.date);
      if (original) {
        pushUndo({
          type:'edit', id,
          before: { description:original.description, amount:original.amount, category:original.category, date:original.date },
          after:  { description:editData.description, amount:editData.amount, category:editData.category, date:editData.date },
        });
      }
      setEditingId(null); setEditData({});
      addNotification('Transaction updated', 'success');
      fetchWithdrawals(); fetchNeedsReview();
    } catch { addNotification('Failed to update', 'error'); }
  };

  // ── Undo ──
  const undo = async () => {
    if (undoStack.length === 0) { addNotification('Nothing to undo', 'info'); return; }
    const action = undoStack[undoStack.length - 1];
    try {
      if (action.type === 'delete') {
        // Undo delete = re-add the expense
        await addExpense(action.description, parseFloat(action.amount), action.category, action.date);
        addNotification(`Restored: ${action.description}`, 'success');
      } else if (action.type === 'add') {
        // Undo add = delete the expense
        await deleteExpense(action.id);
        addNotification(`Removed: ${action.description}`, 'success');
      } else if (action.type === 'edit') {
        // Undo edit = revert to before values
        await updateExpense(action.id, action.before.description, parseFloat(action.before.amount), action.before.category, action.before.date);
        addNotification(`Reverted: ${action.before.description}`, 'success');
      }
      setUndoStack(s => s.slice(0, -1));
      setRedoStack(s => [...s, action]);
      await fetchExpenses();
      fetchWithdrawals(); fetchNeedsReview();
    } catch { addNotification('Failed to undo', 'error'); }
  };

  // ── Redo ──
  const redo = async () => {
    if (redoStack.length === 0) { addNotification('Nothing to redo', 'info'); return; }
    const action = redoStack[redoStack.length - 1];
    try {
      if (action.type === 'delete') {
        await deleteExpense(action.id);
        addNotification(`Deleted again: ${action.description}`, 'success');
      } else if (action.type === 'add') {
        await addExpense(action.description, parseFloat(action.amount), action.category, action.date);
        addNotification(`Re-added: ${action.description}`, 'success');
      } else if (action.type === 'edit') {
        await updateExpense(action.id, action.after.description, parseFloat(action.after.amount), action.after.category, action.after.date);
        addNotification(`Re-applied: ${action.after.description}`, 'success');
      }
      setRedoStack(s => s.slice(0, -1));
      setUndoStack(s => [...s, action]);
      await fetchExpenses();
      fetchWithdrawals(); fetchNeedsReview();
    } catch { addNotification('Failed to redo', 'error'); }
  };

  // ── Categorize (withdrawal or review) — ALWAYS teach ML ──
  const handleCategorize = async (item, category, storeName) => {
    setCategorizingSaving(true);
    const effectiveDescription = (storeName && storeName.trim()) ? storeName.trim() : (item.description || 'Transaction');
    try {
      const res = await fetch(`${API_BASE}/update-expense.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense_id:  item.id,
          user_id:     user.id,
          description: effectiveDescription,
          amount:      parseFloat(item.amount),
          category,
          date:        item.date,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');

      // Teach the ML — with confirmation threshold
      try {
        const mlRes = await fetch(`${ML_API}/confirm_category`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store:            effectiveDescription,
            category,
            amount:           item.amount,
            sms:              item.raw_sms || item.description,
            transaction_type: item.transaction_type || 'Purchase',
          }),
        });
        const mlData = await mlRes.json();
        if (mlData.learned) {
          setFeedback({ store: effectiveDescription, category, aiLearning: true,
            message: `AI learned: ${effectiveDescription} will always be ${category}` });
        } else {
          const needed = mlData.confirmations_needed || 0;
          setFeedback({ store: effectiveDescription, category, aiLearning: false,
            message: needed > 0
              ? `${needed} more confirmation${needed > 1 ? 's' : ''} needed to teach AI`
              : `Categorized as ${category}` });
        }
      } catch {
        setFeedback({ store: effectiveDescription, category, aiLearning: false, message: '' });
      }

      setPickerItem(null);
      await fetchExpenses();
      await fetchWithdrawals();
      await fetchNeedsReview();
    } catch (err) {
      addNotification('Failed to categorize: ' + err.message, 'error');
    } finally {
      setCategorizingSaving(false);
    }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const filtered = (expenses||[]).filter(t => {
    const d = new Date(t.date);
    if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (t.description||'').toLowerCase().includes(q) || (t.category||'').toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy==='date-desc')   return new Date(b.date)-new Date(a.date);
    if (sortBy==='date-asc')    return new Date(a.date)-new Date(b.date);
    if (sortBy==='amount-desc') return Number(b.amount)-Number(a.amount);
    if (sortBy==='amount-asc')  return Number(a.amount)-Number(b.amount);
    return 0;
  });

  const totalSpent = filtered.reduce((s,t) => s+Number(t.amount), 0);
  const avg        = filtered.length > 0 ? totalSpent/filtered.length : 0;
  const highest    = filtered.length > 0 ? Math.max(...filtered.map(t=>Number(t.amount))) : 0;

  // History display: merge undo + redo stacks for display
  const allHistory = [...undoStack].reverse();

  // ── Banner renderer ───────────────────────────────────────
  const renderBanner = (items, type) => {
    if (!items.length) return null;
    const isReview     = type === 'review';
    const borderColor  = isReview ? '#8B5CF6' : '#F59E0B';
    const bgColor      = isReview ? '#F5F3FF' : '#FFFBEB';
    const dividerColor = isReview ? '#DDD6FE' : '#FCD34D';
    const textColor    = isReview ? '#5B21B6' : '#92400e';

    return (
      <div style={{ marginBottom:16, background:'var(--bg-primary)',
        border:`1px solid ${borderColor}`, borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
        <div style={{ padding:'12px 18px', background:bgColor,
          borderBottom:`1px solid ${dividerColor}`,
          display:'flex', alignItems:'center', gap:10 }}>
          {isReview
            ? <Brain size={16} style={{ color:'#7C3AED', flexShrink:0 }} />
            : <AlertCircle size={16} style={{ color:'#D97706', flexShrink:0 }} />
          }
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:textColor, margin:0 }}>
              {isReview ? `AI Needs Your Help (${items.length})` : `Uncategorized Cash Withdrawals (${items.length})`}
            </p>
            <p style={{ fontSize:12, color:textColor, margin:'1px 0 0', opacity:0.8 }}>
              {isReview
                ? "The AI couldn't confidently categorize these. Your choice helps it learn."
                : 'Tell us what you used the cash for to improve your spending insights.'}
            </p>
          </div>
        </div>
        {items.map((w,i) => {
          const dateStr = new Date(w.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
          return (
            <div key={w.id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'11px 18px',
              borderBottom: i < items.length-1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                <div style={{ width:34, height:34, borderRadius:'var(--radius-md)',
                  background:isReview?'#EDE9FE':'#FEF3C7',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {isReview
                    ? <Brain size={15} style={{ color:'#7C3AED' }} />
                    : <Wallet size={15} style={{ color:'#D97706' }} />
                  }
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)',
                    margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {w.description || (isReview ? 'Unknown Store' : 'Cash Withdrawal')}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', margin:'2px 0 0' }}>
                    {dateStr} · {isReview ? 'Low confidence' : 'Cash Withdrawal'}
                  </p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--danger)' }}>
                  -M{Number(w.amount).toFixed(2)}
                </span>
                <button onClick={() => { setPickerItem(w); setPickerMode(isReview ? 'review' : 'withdrawal'); }}
                  style={{
                    padding:'6px 16px',
                    background:isReview?'#7C3AED':'var(--primary-main)',
                    color:'white', border:'none', borderRadius:'var(--radius-md)',
                    fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
                  }}>
                  Categorize
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageContainer variant="standard">

      {pickerItem && (
        <CategoryPickerModal
          item={pickerItem} mode={pickerMode}
          onSelect={handleCategorize}
          onCancel={() => setPickerItem(null)}
          saving={categorizingSaving}
        />
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)',
            margin:0, letterSpacing:'-0.4px' }}>Transactions</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'4px 0 0' }}>
            Track and manage all your expenses
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
          background:'var(--primary-main)', color:'white', border:'none',
          borderRadius:'var(--radius-lg)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      {renderBanner(withdrawals, 'withdrawal')}
      {renderBanner(needsReview, 'review')}

      {/* Undo/Redo toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
        marginBottom:14, background:'var(--bg-primary)',
        border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)' }}>
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'6px 14px', borderRadius:'var(--radius-md)', fontSize:12,
            cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
            opacity: undoStack.length === 0 ? 0.4 : 1,
            background:'none', border:'1px solid var(--border-main)',
            color:'var(--text-secondary)', transition:'all 0.15s',
          }}>
          <RotateCcw size={13} /> Undo
          {undoStack.length > 0 && (
            <span style={{ fontSize:10, background:'var(--primary-main)', color:'white',
              borderRadius:99, padding:'1px 5px', marginLeft:2 }}>
              {undoStack.length}
            </span>
          )}
        </button>

        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'6px 14px', borderRadius:'var(--radius-md)', fontSize:12,
            cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer',
            opacity: redoStack.length === 0 ? 0.4 : 1,
            background:'none', border:'1px solid var(--border-main)',
            color:'var(--text-secondary)', transition:'all 0.15s',
          }}>
          <RotateCw size={13} /> Redo
          {redoStack.length > 0 && (
            <span style={{ fontSize:10, background:'var(--primary-main)', color:'white',
              borderRadius:99, padding:'1px 5px', marginLeft:2 }}>
              {redoStack.length}
            </span>
          )}
        </button>

        <div style={{ flex:1 }} />

        {allHistory.length > 0 && (
          <button onClick={() => setShowHistory(v=>!v)} style={{
            display:'flex', alignItems:'center', gap:5, padding:'6px 12px',
            background:'none', border:'1px solid var(--border-light)',
            borderRadius:'var(--radius-md)', fontSize:12, cursor:'pointer',
            color:'var(--text-muted)' }}>
            <Clock size={13} /> History ({allHistory.length})
          </button>
        )}
      </div>

      {/* History panel */}
      {showHistory && allHistory.length > 0 && (
        <div style={{ padding:'12px 16px', marginBottom:14, background:'var(--bg-secondary)',
          border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)',
          maxHeight:160, overflowY:'auto' }}>
          {allHistory.slice(0,10).map((h,i) => {
            const label = h.type === 'delete' ? 'Deleted'
                        : h.type === 'add'    ? 'Added'
                        : 'Edited';
            const name  = h.description || h.before?.description || 'Transaction';
            const amt   = h.amount || h.before?.amount || 0;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8,
                padding:'5px 0', borderBottom:'1px solid var(--border-light)',
                fontSize:12, color:'var(--text-secondary)' }}>
                <Clock size={11} style={{ flexShrink:0 }} />
                <span style={{ flex:1 }}>{label}: {name}</span>
                <span style={{ fontWeight:600, color:'var(--text-primary)' }}>
                  M{Number(amt).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
        {[
          { label:'Total Spent', value:`M${totalSpent.toFixed(2)}`, sub:`${filtered.length} transactions`, accent:'#EF4444' },
          { label:'Average',     value:`M${avg.toFixed(2)}`,        sub:'per transaction',                  accent:'#3B82F6' },
          { label:'Highest',     value:`M${highest.toFixed(2)}`,    sub:'single transaction',               accent:'#8B5CF6' },
        ].map(s => (
          <div key={s.label} style={{ padding:'12px 16px', background:'var(--bg-primary)',
            border:'1px solid var(--border-light)', borderRadius:'var(--radius-lg)',
            borderTop:`3px solid ${s.accent}` }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 3px',
              textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>{s.label}</p>
            <p style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', margin:0 }}>{s.value}</p>
            <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'3px 0 0' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:180,
          padding:'8px 12px', background:'var(--bg-primary)',
          border:'1px solid var(--border-light)', borderRadius:'var(--radius-md)' }}>
          <Search size={14} style={{ color:'var(--text-muted)', flexShrink:0 }} />
          <input placeholder="Search transactions..."
            value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{ border:'none', background:'transparent', outline:'none',
              fontSize:13, color:'var(--text-primary)', flex:1, minWidth:0 }} />
          {searchQuery && (
            <button onClick={()=>setSearchQuery('')} style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text-muted)', display:'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}
          style={{ ...inputStyle, width:'auto', padding:'8px 10px' }}>
          {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}
          style={{ ...inputStyle, width:'auto', padding:'8px 10px' }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}
          style={{ ...inputStyle, width:'auto', padding:'8px 10px' }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{ ...inputStyle, width:'auto', padding:'8px 10px' }}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {['All',...CATEGORIES.map(c=>c.name)].map(cat => {
          const cfg    = CAT_MAP[cat];
          const active = filterCategory === cat;
          return (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding:'4px 12px',
              border:`1px solid ${active?(cfg?.color||'var(--primary-main)'):'var(--border-light)'}`,
              borderRadius:99, fontSize:12, fontWeight:active?600:400,
              background:active?(cfg?.color||'var(--primary-main)')+'15':'transparent',
              color:active?(cfg?.color||'var(--primary-main)'):'var(--text-secondary)',
              cursor:'pointer', transition:'all 0.15s',
            }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height:58, borderRadius:'var(--radius-md)' }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {filtered.map(t => {
            const cfg       = CAT_MAP[t.category] || CAT_MAP.Other;
            const Icon      = cfg.icon;
            const dateStr   = new Date(t.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
            const isEditing = editingId === t.id;

            if (isEditing) return (
              <div key={t.id} style={{ padding:'12px 14px', background:'var(--bg-secondary)',
                border:`1px solid var(--primary-main)`, borderRadius:'var(--radius-md)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 140px auto', gap:8, alignItems:'center' }}>
                  <input value={editData.description}
                    onChange={e=>setEditData(d=>({...d,description:e.target.value}))}
                    style={inputStyle} placeholder="Description" />
                  <input type="number" value={editData.amount}
                    onChange={e=>setEditData(d=>({...d,amount:e.target.value}))}
                    style={inputStyle} placeholder="Amount" />
                  <select value={editData.category}
                    onChange={e=>setEditData(d=>({...d,category:e.target.value}))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={() => handleEditSave(t.id)} style={{
                      padding:8, background:'var(--success)', color:'white',
                      border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', display:'flex' }}>
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding:8, background:'none', border:'1px solid var(--border-main)',
                      borderRadius:'var(--radius-sm)', cursor:'pointer', display:'flex',
                      color:'var(--text-muted)' }}>
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={t.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                background:'var(--bg-primary)', border:'1px solid var(--border-light)',
                borderRadius:'var(--radius-md)', transition:'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.borderColor=cfg.color+'40'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-primary)';   e.currentTarget.style.borderColor='var(--border-light)'; }}>
                <div style={{ width:34, height:34, borderRadius:'var(--radius-md)',
                  background:cfg.color+'12', display:'flex', alignItems:'center',
                  justifyContent:'center', color:cfg.color, flexShrink:0 }}>
                  <Icon size={15} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)',
                    margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.description || 'Transaction'}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', margin:'2px 0 0',
                    display:'flex', gap:5, alignItems:'center' }}>
                    <span style={{ color:cfg.color, fontWeight:500 }}>{t.category||'Other'}</span>
                    <span style={{ opacity:0.4 }}>&middot;</span>
                    <span>{dateStr}</span>
                  </p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--danger)',
                  margin:0, whiteSpace:'nowrap', flexShrink:0 }}>
                  -M{Math.abs(Number(t.amount)).toFixed(2)}
                </p>
                <div style={{ display:'flex', gap:2, flexShrink:0, marginLeft:4 }}>
                  <button
                    onClick={() => { setEditingId(t.id); setEditData({ description:t.description||'', amount:t.amount, category:t.category||'Other', date:t.date }); }}
                    style={{ padding:7, background:'none', border:'none', cursor:'pointer',
                      color:'var(--text-muted)', borderRadius:'var(--radius-sm)', display:'flex' }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.description||'Transaction', t.amount, t.category, t.date)}
                    style={{ padding:7, background:'none', border:'none', cursor:'pointer',
                      color:'var(--text-muted)', borderRadius:'var(--radius-sm)', display:'flex' }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--danger)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'48px 20px', textAlign:'center', gap:10 }}>
          <div style={{ width:48, height:48, borderRadius:'var(--radius-lg)',
            background:'var(--bg-tertiary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Wallet size={22} style={{ color:'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>
            {searchQuery || filterCategory!=='All' ? 'No matching transactions' : 'No transactions yet'}
          </p>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>
            {searchQuery || filterCategory!=='All'
              ? 'Try adjusting your filters'
              : 'Add an expense or forward a bank SMS to get started.'}
          </p>
          {!searchQuery && filterCategory==='All' && (
            <button onClick={() => setShowAddModal(true)} style={{
              marginTop:8, padding:'9px 20px', background:'var(--primary-main)', color:'white',
              border:'none', borderRadius:'var(--radius-lg)', fontSize:13, fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={14} /> Add Expense
            </button>
          )}
        </div>
      )}

      <CategorizationFeedback data={feedback} onDone={() => setFeedback(null)} />

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)}
        onAdd={() => { fetchExpenses(); addNotification('Expense added','success'); }} />
    </PageContainer>
  );
}